// 每页都引这一个（<script type="module" src="/assets/page.js">）：
// 1) 挂图：<figure data-fig="./xxx.js"> → import 那个模块，调用 default(figure)
// 2) 正文里带 data-set 的按钮 / 表格行 → 交给图的 api.set(...)
// 3) 首页小图：<div class="mini" data-mini="/posts/x/mini.js"> 滚到眼前才加载
// 4) 旁注、公式
// 5) 文章页底部的上一篇 / 下一篇：按 posts.js 的顺序自动填，不用手写

if (window.renderMathInElement) renderMathInElement(document.body, {
  delimiters: [{ left: '\\[', right: '\\]', display: true }, { left: '\\(', right: '\\)', display: false }],
  strict: 'ignore', throwOnError: false,
});

document.querySelectorAll('.mn').forEach(n => {
  const mark = Object.assign(document.createElement('button'), { className: 'mn-mark', textContent: '注' });
  mark.onclick = () => n.classList.toggle('open');
  n.before(mark);
});

const slug = location.pathname.match(/^\/posts\/([^/]+)\/?$/)?.[1];
if (slug) {
  const { NOTES, TEXTS } = await import('/assets/posts.js');
  for (const list of [NOTES, TEXTS]) {
    const i = list.findIndex(p => p.slug === slug), foot = document.querySelector('footer.site');
    if (i < 0 || !foot) continue;
    const prev = list[i - 1], next = list[i + 1];
    foot.innerHTML = (prev ? `<a href="/posts/${prev.slug}/">← ${prev.title}</a>` : '<a href="/">← 首页</a>') + "<span>Cr's Blog</span>" + (next ? `<a href="/posts/${next.slug}/">${next.title} →</a>` : '<a href="/">首页 →</a>');
  }
}

const figs = [...document.querySelectorAll('[data-fig]')];
await Promise.all(figs.map(async fig => {
  try { (await import(new URL(fig.dataset.fig, location.href))).default(fig); }
  catch (err) { console.error('图没挂上：', fig.dataset.fig, err); }
}));

document.addEventListener('click', e => {
  const t = e.target.closest('[data-set]');
  if (!t) return;
  // 图里面的按钮管自己那张图；正文里的默认管第一张，data-target 可以指定
  const fig = t.closest('[data-fig]') || (t.dataset.target ? document.querySelector(t.dataset.target) : figs[0]);
  if (!fig?.api) return;
  fig.api.set(JSON.parse(t.dataset.set));
  const r = fig.getBoundingClientRect();
  if (r.bottom < 80 || r.top > innerHeight - 80) fig.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// 首页小图：滚到眼前才挂；IntersectionObserver 万一不触发（比如页面在后台），load 后 2 秒也全部挂上
const mountMini = async el => {
  if (el.dataset.mounted) return;
  el.dataset.mounted = '1';
  try {
    (await import(new URL(el.dataset.mini, location.href))).default(el);
    el.classList.add('hint');   // 第一次出现时轻轻提示一下“这里能动”
  } catch (err) { console.error('小图没挂上：', el.dataset.mini, err); }
};
export function watchMinis(root = document) {
  const minis = root.querySelectorAll('[data-mini]:not([data-mounted])');
  if (!minis.length) return;
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); mountMini(e.target); } }), { rootMargin: '200px' });
  minis.forEach(m => io.observe(m));
  const late = () => setTimeout(() => minis.forEach(mountMini), 2000);
  document.readyState === 'complete' ? late() : addEventListener('load', late, { once: true });
}
watchMinis();

