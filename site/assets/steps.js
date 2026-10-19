// 步骤 / 分支走查：数据驱动，红色按钮选分支。文章和速查都用它。
// mount(el, data) 把走查画进 el，返回 { go(path), reset(), path() }
//
// data = {
//   start: 'id',
//   nodes: {
//     id: {
//       title: '这一步叫什么',
//       html: '一段说明（可以带 <kbd> <code> <a>）',
//       list: ['按顺序做的小步骤', …],
//       code: 'git clone …' 或 [{ label: 'Intel', code: '…' }, …],   // 带“复制”按钮
//       choices: [{ label: '按钮上的字', to: 'id' }, …],              // 分支：红色按钮
//       next: 'id', nextLabel: '下一步',                             // 没有分支时往下走
//     }, …
//   },
//   onChange(path) {}   // 可选：走到哪了
// }
// 走过的步骤留在上面，点前面别的分支就从那里改道。

const CSS = `
.stw { font-size: .92rem; line-height: 1.7; }
.stw ol.stw-trail { list-style: none; margin: 0; padding: 0; }
.stw-node { position: relative; padding: 0 0 1.1rem 2.1rem; }
.stw-node::before { content: ''; position: absolute; left: .7rem; top: 1.6rem; bottom: .1rem; border-left: 1px dashed var(--line); }
.stw-node:last-child::before { display: none; }
.stw-node.fresh { animation: stw-in .35s ease-out; }
@keyframes stw-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .stw-node.fresh { animation: none; } }
.stw-n { position: absolute; left: 0; top: .12rem; width: 1.45rem; height: 1.45rem; border-radius: 50%; display: grid; place-items: center; font: 600 .74rem/1 var(--sans); color: var(--ink2); border: 1px solid var(--line); background: var(--panel); }
.stw-node.cur .stw-n { color: #fff; background: var(--ink); border-color: var(--ink); }
.stw-node.end .stw-n { color: #fff; background: var(--fig-ok); border-color: var(--fig-ok); }
.stw-t { font-weight: 600; margin: 0 0 .15rem; }
.stw-b p { margin: .25rem 0; }
.stw-b ol, .stw-b ul { margin: .3rem 0; padding-left: 1.2em; }
.stw-b li { margin: .15rem 0; }
.stw kbd { font: .8em var(--mono); border: 1px solid color-mix(in srgb, var(--ink) 25%, transparent); border-bottom-width: 2px; border-radius: 4px; padding: 0 .35em; background: var(--panel); white-space: nowrap; }
.stw-code { margin: .45rem 0; }
.stw-code .lab { display: flex; justify-content: space-between; align-items: flex-end; gap: .5rem; font-size: .74rem; color: var(--mute); margin: .35rem 0 .2rem; }
.stw-code pre { margin: 0; font-size: 12.5px; white-space: pre; }
.stw-code .btn { font-size: .72rem; padding: 0 .55rem; flex: none; }
.stw-ch { margin-top: .5rem; }
.stw-ch button[aria-pressed="false"].past { opacity: .7; }
.stw-next { margin-top: .5rem; }
.stw-done { color: var(--fig-ok); font-size: .84rem; margin-top: .3rem; }
.stw-foot { display: flex; gap: .4rem; flex-wrap: wrap; border-top: 1px dashed var(--line); padding-top: .6rem; }
.stw-foot .btn { font-size: .78rem; }
`;

function injectCss() {
  if (document.getElementById('stw-css')) return;
  const s = document.createElement('style');
  s.id = 'stw-css'; s.textContent = CSS;
  document.head.appendChild(s);
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function copy(text, btn) {
  const done = () => { const t = btn.textContent; btn.textContent = '已复制'; setTimeout(() => (btn.textContent = t), 1200); };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, () => {});
  else {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch {}
    ta.remove();
  }
}

export function mount(el, data) {
  injectCss();
  const { nodes, start } = data;
  el.classList.add('stw');
  el.innerHTML = '<ol class="stw-trail"></ol><div class="stw-foot"><button type="button" class="btn stw-back">← 退一步</button><button type="button" class="btn stw-reset">从头来</button></div>';
  const trailEl = el.querySelector('.stw-trail');
  let trail = [start];

  function codeBlock(c) {
    const list = typeof c === 'string' ? [{ code: c }] : c;
    return `<div class="stw-code">${list.map((x, i) => `<div class="lab"><span>${x.label ? esc(x.label) : ''}</span><button type="button" class="btn" data-copy="${i}">复制</button></div><pre><code>${esc(x.code)}</code></pre>`).join('')}</div>`;
  }

  function render(freshFrom = Infinity, scroll = false) {
    trailEl.innerHTML = trail.map((id, i) => {
      const n = nodes[id], last = i === trail.length - 1, nextId = trail[i + 1];
      const end = !n.choices?.length && !n.next;
      let ctl = '';
      if (n.choices?.length) ctl = `<div class="seg stw-ch">${n.choices.map((c, j) => `<button type="button" data-i="${i}" data-to="${esc(c.to)}" aria-pressed="${c.to === nextId}"${nextId && c.to !== nextId ? ' class="past"' : ''}>${c.label}</button>`).join('')}</div>`;
      else if (n.next && last) ctl = `<div class="stw-next"><button type="button" class="btn" data-i="${i}" data-to="${esc(n.next)}">${n.nextLabel || '下一步'} →</button></div>`;
      else if (end) ctl = '<div class="stw-done">✓ 这条路走完了</div>';
      return `<li class="stw-node${last ? ' cur' : ''}${end ? ' end' : ''}${i >= freshFrom ? ' fresh' : ''}" data-i="${i}">
        <span class="stw-n">${i + 1}</span>
        ${n.title ? `<p class="stw-t">${n.title}</p>` : ''}
        <div class="stw-b">${n.html ? `<p>${n.html}</p>` : ''}${n.list ? `<ol>${n.list.map(x => `<li>${x}</li>`).join('')}</ol>` : ''}${n.code ? codeBlock(n.code) : ''}${n.after ? `<p>${n.after}</p>` : ''}</div>
        ${ctl}
      </li>`;
    }).join('');
    el.querySelector('.stw-back').disabled = trail.length < 2;
    el.querySelector('.stw-back').style.opacity = trail.length < 2 ? .4 : 1;
    if (scroll) trailEl.lastElementChild?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    data.onChange?.(trail.slice());
  }

  el.addEventListener('click', e => {
    const cp = e.target.closest('[data-copy]');
    if (cp) { copy(cp.closest('.lab').nextElementSibling.textContent, cp); return; }
    const b = e.target.closest('button[data-to]');
    if (b) {
      const i = +b.dataset.i, to = b.dataset.to;
      if (trail[i + 1] === to) return;
      trail = [...trail.slice(0, i + 1), to];
      render(i + 1, true);
      return;
    }
    if (e.target.closest('.stw-back') && trail.length > 1) { trail.pop(); render(); }
    if (e.target.closest('.stw-reset')) { trail = [start]; render(0); }
  });

  // path：节点 id 的数组，可以不带起点；中间断了（不是上一步的分支）就停在能走到的地方
  function go(path) {
    const p = path[0] === start ? path.slice(1) : path.slice();
    trail = [start];
    for (const id of p) {
      const n = nodes[trail.at(-1)];
      const ok = n.next === id || n.choices?.some(c => c.to === id);
      if (!ok || !nodes[id]) break;
      trail.push(id);
    }
    render(1);
  }

  render(0);
  return { go, reset: () => go([]), path: () => trail.slice() };
}
