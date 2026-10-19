// 速查公告栏：一行，每 4 秒往上换一条；点开按篇幅弹浮窗（short）或右侧抽屉（long）。
// 内容从速查自己的页面里取：优先 .note-body，没有就取正文（去掉标题和尾注）。只有一份内容。
import { NOTES } from './posts.js';

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const cache = new Map();

export function mountBoard(el, notes = NOTES) {
  const list = el.querySelector('.board-list'), win = el.querySelector('.board-window');
  list.innerHTML = notes.map((n, i) => `<li><button class="board-item" data-i="${i}"><b>${n.title}</b><span>${n.line}</span></button></li>`).join('');
  el.querySelector('.board-all').textContent = `${notes.length} 条 →`;
  let i = 0, paused = false;
  const items = [...list.querySelectorAll('.board-item')];
  const go = k => {
    i = (k + notes.length) % notes.length;
    list.style.transform = `translateY(${-i * win.clientHeight}px)`;
    items.forEach((b, j) => { b.tabIndex = j === i ? 0 : -1; b.setAttribute('aria-hidden', j !== i); });
  };
  go(0);
  if (!reduce()) setInterval(() => { if (!paused && !document.hidden) go(i + 1); }, 4000);
  el.addEventListener('pointerenter', () => paused = true);
  el.addEventListener('pointerleave', () => paused = false);
  el.addEventListener('focusin', () => paused = true);
  el.addEventListener('focusout', () => paused = false);
  el.querySelector('.board-prev').onclick = () => go(i - 1);
  el.querySelector('.board-next').onclick = () => go(i + 1);
  el.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { go(i + 1); items[i].focus(); } if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { go(i - 1); items[i].focus(); } });
  list.addEventListener('click', e => { const b = e.target.closest('.board-item'); if (b) openNote(notes[+b.dataset.i], b); });
  new ResizeObserver(() => go(i)).observe(win);
}

// 取速查内容
async function load(note) {
  if (cache.has(note.slug)) return cache.get(note.slug);
  const url = note.url || `/notes/${note.slug}/`;
  const doc = new DOMParser().parseFromString(await (await fetch(url)).text(), 'text/html');
  let body = doc.querySelector('.note-body');
  if (!body) {   // 还没改成速查格式的旧页面：取正文，去掉页头和尾注
    body = doc.createElement('div'); body.className = 'note-body';
    [...(doc.querySelector('main.post')?.children || [])].forEach(c => { if (!c.matches('.kicker, h1, .src, .can')) body.append(c); });
  }
  const res = { url, html: body.outerHTML, math: /\\\(|\\\[/.test(body.textContent) };
  cache.set(note.slug, res);
  return res;
}

let dlg, lastTrigger;
function dialog() {
  if (dlg) return dlg;
  dlg = document.createElement('dialog');
  dlg.className = 'note-pop';
  dlg.innerHTML = `<header><div><div class="kicker"><span>速查</span><time></time></div><h2></h2></div><nav><a class="open" target="_self">单独打开 ↗</a><button class="close" aria-label="关闭">×</button></nav></header><div class="pop-body"></div>`;
  document.body.append(dlg);
  dlg.querySelector('.close').onclick = () => closeNote();
  dlg.addEventListener('cancel', e => { e.preventDefault(); closeNote(); });
  dlg.addEventListener('click', e => { if (e.target === dlg) closeNote(); });   // 点到外面（backdrop）
  // 速查里的“试试”按钮管它旁边那张图
  dlg.addEventListener('click', e => {
    const t = e.target.closest('[data-set]'); if (!t) return;
    e.stopPropagation();
    const fig = t.closest('[data-fig]') || dlg.querySelector('[data-fig]');
    fig?.api?.set(JSON.parse(t.dataset.set));
  }, true);
  return dlg;
}

export async function openNote(note, trigger) {
  lastTrigger = trigger;
  const d = dialog();
  d.classList.remove('short', 'long', 'closing');
  d.classList.add(note.size === 'long' ? 'long' : 'short');
  d.querySelector('h2').textContent = note.title;
  d.querySelector('time').textContent = note.date;
  const body = d.querySelector('.pop-body');
  body.innerHTML = '<p class="loading">…</p>';
  if (note.size !== 'long' && trigger && innerWidth > 640) {   // 浮窗贴着公告栏下面
    const r = (trigger.closest('.board') || trigger).getBoundingClientRect();
    d.style.setProperty('--top', `${Math.max(12, r.bottom + 8)}px`);
    d.style.setProperty('--left', `${Math.min(r.left, innerWidth - Math.min(448, innerWidth - 24) - 12)}px`);
  }
  if (!d.open) d.showModal();
  try {
    const { url, html, math } = await load(note);
    d.querySelector('.open').href = url;
    body.innerHTML = html;
    await mountFigures(body, url);
    if (math) await katex(body);
  } catch (err) {
    body.innerHTML = `<p>没读到内容。<a href="${note.url || `/notes/${note.slug}/`}">去单独的页面看 →</a></p>`;
    console.error(err);
  }
}

export function closeNote() {
  if (!dlg?.open) return;
  const done = () => { dlg.close(); dlg.classList.remove('closing'); lastTrigger?.focus(); };
  if (reduce()) return done();
  dlg.classList.add('closing');
  setTimeout(done, 220);
}

async function mountFigures(root, base) {
  await Promise.all([...root.querySelectorAll('[data-fig]')].map(async fig => {
    try { (await import(new URL(fig.dataset.fig, new URL(base, location.href)))).default(fig); }
    catch (err) { console.error('速查里的图没挂上：', fig.dataset.fig, err); }
  }));
}

// 首页默认不带 KaTeX，速查里有公式时再加载
let katexReady;
function katex(root) {
  katexReady ??= new Promise(res => {
    const css = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css' });
    document.head.append(css);
    const js = Object.assign(document.createElement('script'), { src: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js' });
    js.onload = () => { const ar = Object.assign(document.createElement('script'), { src: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js' }); ar.onload = res; document.head.append(ar); };
    document.head.append(js);
  });
  return katexReady.then(() => renderMathInElement(root, { delimiters: [{ left: '\\[', right: '\\]', display: true }, { left: '\\(', right: '\\)', display: false }], strict: 'ignore', throwOnError: false }));
}
