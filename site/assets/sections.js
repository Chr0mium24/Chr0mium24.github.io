// 栏目页：文章（按主题）、随笔（整条流）、速查（点开弹窗）、工具、归档（按年份）。都从 posts.js 来。
import { ARTICLES, TEXTS, NOTES, TOOLS, ARCHIVED_TOOLS, md } from './posts.js';
import { openNote } from './board.js';
import { fillEssay, essayShell } from './essays.js';
import { watchMinis } from './page.js';

const ymd = d => d.slice(2).replaceAll('-', '.');
const ai = p => p.ai ? ' · AI 生成' : '';
const row = p => `<a class="doc" href="/posts/${p.slug}/"><time>${ymd(p.date)}</time><span class="t">${p.title}</span><span class="topic">${p.topic}${ai(p)}</span><span class="d">${p.dek}</span></a>`;

const render = {
  articles(el) {
    const topics = [...new Set(ARTICLES.map(a => a.topic))];
    el.innerHTML = `<div class="seg chips" id="topic"><button value="" aria-pressed="true">全部</button>${topics.map(t => `<button value="${t}" aria-pressed="false">${t}</button>`).join('')}</div>`
      + topics.map(t => { const ps = ARTICLES.filter(a => a.topic === t); return `<section data-topic="${t}"><h2 class="group"><span>${t}</span><span>${ps.length}</span></h2>${ps.map(row).join('')}</section>`; }).join('');
    el.querySelector('#topic').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      el.querySelectorAll('#topic button').forEach(x => x.setAttribute('aria-pressed', x === b));
      el.querySelectorAll('section[data-topic]').forEach(s => s.hidden = b.value && s.dataset.topic !== b.value);
    });
  },
  essays(el) {
    el.innerHTML = `<div class="essays">${TEXTS.map(p => essayShell(p, md)).join('')}</div>`;
    el.querySelectorAll('.essays article').forEach((a, i) => fillEssay(a.querySelector('.essay'), TEXTS[i]));
  },
  notes(el) {
    el.innerHTML = NOTES.map((n, i) => `<button class="note-row" data-i="${i}"><b>${n.title}</b><span>${n.line}</span><i>${n.size === 'long' ? '展开 →' : '看一眼'}</i></button>`).join('');
    el.addEventListener('click', e => { const b = e.target.closest('.note-row'); if (b) openNote(NOTES[+b.dataset.i], b); });
  },
  tools(el) {
    el.innerHTML = TOOLS.map(t => `<div class="tool-card"><div class="mini" data-mini="${t.mini}"></div><div><h3><a href="/tools/${t.file}">${t.title}</a></h3><p>${t.line}</p><a class="more-link" href="/tools/${t.file}">打开 →</a></div></div>`).join('')
      + `<h2 class="group"><span>归档</span><span>${ARCHIVED_TOOLS.length}</span></h2><ul class="archived">${ARCHIVED_TOOLS.map(t => `<li><a href="/tools/${t.file}">${t.title}</a></li>`).join('')}</ul>`;
    watchMinis(el);
  },
  archive(el) {
    const all = [
      ...ARTICLES.map(p => ({ ...p, href: `/posts/${p.slug}/`, kind: p.topic })),
      ...TEXTS.map(p => ({ ...p, href: `/posts/${p.slug}/` })),
      ...NOTES.map(p => ({ ...p, href: p.url || `/notes/${p.slug}/`, kind: '速查' })),
    ].sort((a, b) => b.date.localeCompare(a.date));
    const years = [...new Set(all.map(p => p.date.slice(0, 4)))];
    el.innerHTML = years.map(y => { const ps = all.filter(p => p.date.startsWith(y)); return `<h2 class="group"><span>${y}</span><span>${ps.length}</span></h2>${ps.map(p => `<a class="doc" href="${p.href}"><time>${md(p.date)}</time><span class="t">${p.title}</span><span class="topic">${p.kind}</span></a>`).join('')}`; }).join('')
      + `<h2 class="group"><span>归档的工具</span><span>${ARCHIVED_TOOLS.length}</span></h2><ul class="archived">${ARCHIVED_TOOLS.map(t => `<li><a href="/tools/${t.file}">${t.title}</a></li>`).join('')}</ul>`;
  },
};

export function mount(name) { render[name](document.getElementById('list')); }
