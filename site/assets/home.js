// 首页：左边能玩的卡片（小图本身就能玩），右边随笔直接摆正文。
import { NOTES, DOCS, TEXTS, TOOLS } from './posts.js';

const cards = document.getElementById('cards');
cards.innerHTML = NOTES.map(p => `
  <article class="card" data-tag="${p.tag}">
    <div class="mini" data-mini="${p.mini}"></div>
    <div class="meta"><span>${p.tag}</span><time>${p.date}</time>${p.ai ? '<span class="ai">AI 生成</span>' : ''}</div>
    <h3><a href="/posts/${p.slug}/">${p.title}</a></h3>
    <p class="q">${p.q}</p>
    <div class="act">${p.act}</div>
  </article>`).join('');
document.getElementById('ncount').textContent = `${NOTES.length} 篇`;

// 按主题筛
const tags = ['全部', ...new Set(NOTES.map(p => p.tag))];
const chips = document.getElementById('chips');
chips.innerHTML = tags.map(t => `<button value="${t}" aria-pressed="${t === '全部'}">${t}</button>`).join('');
chips.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
  cards.querySelectorAll('.card').forEach(c => c.hidden = b.value !== '全部' && c.dataset.tag !== b.value);
});

// 其余笔记：按年分组的一行一篇，标题后面老实写多长
const docs = document.getElementById('docs');
let year = '';
docs.innerHTML = DOCS.map(p => {
  const y = p.date.slice(0, 4), head = y !== year ? `<h4>${(year = y)}</h4>` : '';
  return `${head}<a class="doc" href="/posts/${p.slug}/"><time>${p.date.slice(5)}</time><span class="t">${p.title}</span><span class="k">${p.tag} · ${p.size}${p.ai ? ' · <span class="ai">AI 生成</span>' : ''}</span></a>`;
}).join('');
document.getElementById('dcount').textContent = `${DOCS.length} 篇，还没做成能玩的`;

// 小工具：缩略图 + 标题，新窗口打开（和旧博客的 Web Pages 一样）
document.getElementById('tool-list').innerHTML = TOOLS.map(t => `
  <a class="tool" href="/tools/${t.file}" target="_blank" rel="noopener">
    <img src="/tools/thumbs/${t.file.replace(/\.html$/, '.png')}" alt="" loading="lazy">
    <span>${t.title}</span>
  </a>`).join('');
document.getElementById('tcount').textContent = `${TOOLS.length} 个单页工具`;

// 随笔：从文章页里取正文。短的整篇放，长的切一刀，老实写还剩多少
const list = document.getElementById('essay-list');
const md = d => d.slice(5).replace('-', '·');
const SHOW = 8;   // 最近 8 篇摆正文，更早的列标题
const shown = TEXTS.slice(0, SHOW), older = TEXTS.slice(SHOW);
list.innerHTML = shown.map(p => `<article id="e-${p.slug}"><div class="d"><time>${md(p.date)}</time><span>${p.kind}</span></div><h3><a href="/posts/${p.slug}/">${p.title}</a></h3><div class="essay"></div></article>`).join('')
  + (older.length ? `<h4 class="older">更早</h4>` + older.map(p => `<a class="doc" href="/posts/${p.slug}/"><time>${p.date.slice(2).replaceAll('-', '.')}</time><span class="t">${p.title}</span><span class="k">${p.kind}</span></a>`).join('') : '');
await Promise.all(shown.map(async p => {
  const box = list.querySelector(`#e-${p.slug} .essay`);
  try {
    const html = await (await fetch(`/posts/${p.slug}/`)).text();
    const src = new DOMParser().parseFromString(html, 'text/html').querySelector('.essay');
    const kids = [...src.children];
    const len = el => el.textContent.replace(/\s/g, '').length;
    const total = kids.reduce((n, k) => n + len(k), 0);
    let keep = kids, cut = '';
    if (p.kind === '攻略') {
      keep = kids.slice(0, 1);
      const items = src.querySelectorAll(':scope > ol > li').length;
      cut = `✂ 还有 ${items} 条`;
    } else if (total > 320 && total - len(kids[0]) >= 100) {   // 剩下不到 100 字就不切了
      keep = kids.slice(0, 1);
      cut = `✂ 还有 ${((total - len(kids[0])) / 1000).toFixed(1)}k 字`;
    }
    box.append(...keep.map(k => document.importNode(k, true)));
    if (cut) box.insertAdjacentHTML('beforeend', `<a class="cut" href="/posts/${p.slug}/">${cut}</a>`);
  } catch { box.innerHTML = `<p><a href="/posts/${p.slug}/">去看正文</a></p>`; }
}));
