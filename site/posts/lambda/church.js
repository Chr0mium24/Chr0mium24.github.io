// 图：Church 数。原文的 Python lambda 一行一行照搬成 JS，真的跑一遍，再把“f 用了几次”画出来。
import { flash, seg } from '/assets/fig.js';

// ---- 照搬原文 ----
const ZERO = f => x => x;
const SUC = n => f => x => n(f)(f(x));
const to_int = n => n(x => x + 1)(0);
const to_church = n => n === 0 ? ZERO : SUC(to_church(n - 1));
const ONE = to_church(1);
const ADD = m => n => f => x => m(f)(n(f)(x));
const MUL = m => n => f => x => m(x1 => n(f)(x1))(x);
const POW = m => n => n(MUL(m))(ONE);            // POW(m)(n) = m^n
const PAIR = x => y => f => f(x)(y);
const FST = p => p(x => y => x);
const LST = p => p(x => y => y);
const PHI = p => PAIR(LST(p))(SUC(LST(p)));
const PRED = n => FST(n(PHI)(PAIR(ZERO)(ZERO)));
const SUB = m => n => n(PRED)(m);

const OPS = {
  SUC: { arity: 1, run: (m, n) => SUC(to_church(n)), call: 'SUC(n)' },
  ADD: { arity: 2, run: (m, n) => ADD(to_church(m))(to_church(n)), call: 'ADD(m)(n)' },
  MUL: { arity: 2, run: (m, n) => MUL(to_church(m))(to_church(n)), call: 'MUL(m)(n)' },
  POW: { arity: 2, run: (m, n) => POW(to_church(m))(to_church(n)), call: 'POW(m)(n)' },
  PRED: { arity: 1, run: (m, n) => PRED(to_church(n)), call: 'PRED(n)' },
  SUB: { arity: 2, run: (m, n) => SUB(to_church(m))(to_church(n)), call: 'SUB(m)(n)' },
};
const NAMES = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR'];

export default function mount(fig) {
  const st = { op: 'ADD', m: 3, n: 2 };
  const view = fig.querySelector('.church'), out = fig.querySelector('.readout');
  const code = document.querySelector('.codebox');
  const setOp = seg(fig.querySelector('.seg'), v => { st.op = v; draw(); });

  const chip = (cls, t = 'f') => `<span class="chip ${cls}">${t}</span>`;
  const chain = (k, cls) => Array.from({ length: k }, () => chip(cls)).join('');
  const nest = k => k === 0 ? 'x' : k > 8 ? `f(f(…f(x)…))　共 ${k} 个 f` : 'f('.repeat(k) + 'x' + ')'.repeat(k);

  function draw() {
    const { op, m, n } = st, O = OPS[op];
    fig.querySelectorAll('.m-row').forEach(e => e.hidden = O.arity === 1);
    fig.querySelector('output[name=m]').textContent = m;
    fig.querySelector('output[name=n]').textContent = n;
    const v = to_int(O.run(m, n));
    let body = '';
    if (op === 'SUC') body = row('n', chain(n, 'a')) + row('SUC 多用一次', chip('b'));
    if (op === 'ADD') body = row('先用 n 次', chain(n, 'a') || '<i>0 次</i>') + row('再用 m 次', chain(m, 'b') || '<i>0 次</i>');
    if (op === 'MUL') body = Array.from({ length: m }, (_, i) => row(`第 ${i + 1} 份 n(f)`, chain(n, i % 2 ? 'b' : 'a') || '<i>0 次</i>')).join('') || row('m = 0', '<i>一份都没有</i>');
    if (op === 'POW') {
      let k = 1; body = row('从 ONE 开始', `<b>1</b>`);
      for (let i = 1; i <= n; i++) { k *= m; body += row(`乘第 ${i} 次 m`, `<b>${k}</b>`); }
      body += row('一共用 f', v <= 64 ? `<span class="dots">${chain(v, 'a dot')}</span>` : `<b>${v}</b> 次`);
    }
    if (op === 'PRED') {
      let a = 0, b = 0; body = row('起点', pair(a, b));
      for (let i = 1; i <= n; i++) { a = b; b = b + 1; body += row(`PHI 第 ${i} 次`, pair(a, b, i === n)); }
      body += row('取 FST', `<b>${a}</b>`);
    }
    if (op === 'SUB') {
      let k = m; body = row('从 m 开始', `<b>${k}</b>`);
      for (let i = 1; i <= n; i++) { k = Math.max(0, k - 1); body += row(`PRED 第 ${i} 次`, `<b>${k}</b>${k === 0 && i <= n && m - i < 0 ? ' <i>到 0 就停了</i>' : ''}`); }
    }
    view.innerHTML = `<div class="expr">${O.call.replace('m', NAMES[m] ?? m).replace('n', NAMES[n] ?? n)} = λf.λx. ${nest(v)}</div>${body}`;
    out.innerHTML = `真的跑了一遍：<code>to_int(${O.call.replace('m', NAMES[m]).replace('n', NAMES[n])})</code> = <b class="ok">${v}</b>` +
      (op === 'PRED' ? '。PRED 不能“往回走”，只能从 (0,0) 起一对一对往前挪 n 次，取前一个。' : op === 'SUB' && m < n ? '。Church 数没有负数，减过头就停在 0。' : '');
    code?.querySelectorAll('.ln').forEach(l => l.classList.toggle('on', l.dataset.op === op));
    setOp(op);
  }
  const row = (label, html) => `<div class="crow"><span class="lab">${label}</span><span class="val">${html}</span></div>`;
  const pair = (a, b, last) => `<span class="pair${last ? ' last' : ''}">(${a}, ${b})</span>`;

  fig.querySelectorAll('.stepper').forEach(s => s.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const k = s.dataset.k; st[k] = Math.min(4, Math.max(0, st[k] + (+b.value))); draw();
  }));
  code?.addEventListener('click', e => { const l = e.target.closest('.ln[data-op]'); if (l) fig.api.set({ op: l.dataset.op }); });
  fig.api = { set(o = {}) { Object.assign(st, o); draw(); flash(fig); } };
  draw();
}
