// 首页：一句话 + 速查公告栏 + 最近三篇（带小图）+ 一个原地切换的页签（文章 / 随笔 / 工具）。
// 首页长度固定在两屏左右，东西再多也只是各栏目页变长。
import { ARTICLES, TEXTS, TOOLS, md } from './posts.js';
import { mountBoard } from './board.js';
import { fillEssay, essayShell } from './essays.js';

mountBoard(document.getElementById('board'));

// 最近：最新三篇有小图的文章，第一篇做大卡
const featured = ARTICLES.filter(a => a.mini).slice(0, 3);
const card = (p, i) => `
  <article class="card rise" style="--i:${i + 2}">
    <div class="mini" data-mini="/posts/${p.slug}/mini.js"></div>
    <div class="meta"><span>${p.topic}</span><time>${p.date}</time>${p.ai ? '<span class="ai">AI 生成</span>' : ''}</div>
    <h3><a href="/posts/${p.slug}/">${p.title}</a></h3>
    <p class="q">${p.dek}</p>
  </article>`;
document.getElementById('feature').innerHTML = featured.map(card).join('');

// 点进文章时，标题平滑移到文章页的大标题（跨页 view transition）
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="/posts/"]'); if (!a) return;
  document.querySelectorAll('[style*="view-transition-name"]').forEach(x => x.style.viewTransitionName = '');
  (a.closest('h3') || a.querySelector('.t') || a).style.viewTransitionName = 'post-title';
});

// 页签
const rest = ARTICLES.filter(a => !featured.includes(a));
const panels = {
  articles: () => `<div class="docs">${rest.slice(0, 8).map(p => `<a class="doc" href="/posts/${p.slug}/"><time>${p.date.slice(2).replaceAll('-', '.')}</time><span class="t">${p.title}</span><span class="topic">${p.topic}${p.ai ? ' · AI 生成' : ''}</span></a>`).join('')}</div>
    <div class="tab-foot"><a href="/articles/">全部 ${ARTICLES.length} 篇文章 →</a></div>`,
  essays: () => `<div class="essays">${TEXTS.slice(0, 3).map(p => essayShell(p, md)).join('')}</div>
    <div class="tab-foot"><a href="/essays/">全部 ${TEXTS.length} 篇随笔 →</a></div>`,
  tools: () => TOOLS.map(t => `<div class="tool-card"><div class="mini" data-mini="${t.mini}"></div><div><h3><a href="/tools/${t.file}">${t.title}</a></h3><p>${t.line}</p><a class="more-link" href="/tools/${t.file}">打开 →</a></div></div>`).join('')
    + `<div class="tab-foot"><a href="/tools/">归档的旧工具 →</a></div>`,
};
const stage = document.getElementById('stage');
const { watchMinis } = await import('./page.js');
watchMinis(document.getElementById('feature'));
let current;
async function show(name, animate = true) {
  if (name === current) return;
  current = name;
  document.querySelectorAll('#tabs button').forEach(b => b.setAttribute('aria-pressed', b.value === name));
  const from = stage.offsetHeight;
  stage.innerHTML = panels[name]();
  if (name === 'essays') stage.querySelectorAll('.essays article').forEach((el, i) => fillEssay(el.querySelector('.essay'), TEXTS[i]));
  watchMinis(stage);
  if (!animate || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const to = stage.offsetHeight;
  stage.animate([{ height: from + 'px' }, { height: to + 'px' }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
  stage.firstElementChild?.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.2,.7,.2,1)' });
}
document.getElementById('tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) show(b.value); });
show('articles', false);
