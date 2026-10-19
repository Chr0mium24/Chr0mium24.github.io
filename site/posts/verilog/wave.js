// 图：可以点的波形。clk、a、b 每格点一下翻转（按住拖可以连着刷），
// 下面同时给出 assign 的组合输出 y 和 always @(posedge clk) 里的寄存器 q1、q2。仿真规则见 sim.js。
import { palette, canvas2d, onResize, flash, seg } from '/assets/fig.js';
import { sim } from './sim.js';

const N = 12;
const bits = s => [...s].map(Number);
export const PRESETS = {
  start: { clk: '010101010101', a: '011111001110', b: '111110011100' },
  glitch: { clk: '010101010101', a: '000100000000', b: '111111111111' },
  noclk: { clk: '000000000000', a: '011111001110', b: '111110011100' },
  slow: { clk: '000111000111', a: '011111001110', b: '111110011100' },
};
const ROWS = ['clk', 'a', 'b', 'y', 'q1', 'q2'], INPUT = { clk: 1, a: 1, b: 1 };
const OPNAME = { '&': '与', '|': '或', '^': '异或' };

export default function mount(fig) {
  const cv = fig.querySelector('canvas'), out = fig.querySelector('.readout'), code = fig.querySelector('.vcode');
  const st = { op: '&', blocking: false, ...Object.fromEntries(Object.entries(PRESETS.start).map(([k, v]) => [k, bits(v)])) };
  const setOp = seg(fig.querySelector('.seg.op'), v => { st.op = v; draw(); });
  const setAsg = seg(fig.querySelector('.seg.asg'), v => { st.blocking = v === '='; draw(); });
  let g = null, hover = null, paint = null;

  function draw() {
    const P = palette(fig), r = sim(st);
    const narrow = cv.clientWidth < 420, rh = narrow ? 28 : 32, top = 20, L = narrow ? 30 : 40;
    const { ctx, w, h } = canvas2d(cv, top + ROWS.length * rh + 18);
    const sw = (w - L - 6) / N, X = k => L + k * sw;
    g = { rh, top, L, sw };
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    ctx.font = P.font; ctx.textBaseline = 'middle';
    // 格子、上升沿
    for (let k = 0; k <= N; k++) { ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(X(k), top); ctx.lineTo(X(k), top + ROWS.length * rh); ctx.stroke(); }
    ctx.strokeStyle = P.mute; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(4, top + 3 * rh); ctx.lineTo(w - 4, top + 3 * rh); ctx.stroke(); ctx.setLineDash([]);
    r.edges.forEach(k => {
      ctx.strokeStyle = P.ref; ctx.globalAlpha = .7; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(X(k), top - 4); ctx.lineTo(X(k), top + ROWS.length * rh); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.fillStyle = P.ref; ctx.textAlign = 'center'; ctx.fillText('↑', X(k), 9);
    });
    // 每一行
    ROWS.forEach((name, i) => {
      const y0 = top + i * rh, hi = y0 + 7, lo = y0 + rh - 7;
      const vals = name in INPUT ? st[name] : r[name];
      if (name in INPUT && hover && hover.row === name) { ctx.fillStyle = P.hand; ctx.globalAlpha = .08; ctx.fillRect(X(hover.k), y0 + 2, sw, rh - 4); ctx.globalAlpha = 1; }
      ctx.fillStyle = name in INPUT ? P.hand : name === 'y' ? P.ink : P.ok;
      ctx.textAlign = 'left'; ctx.font = '600 12px SF Mono, Menlo, monospace'; ctx.fillText(name, 4, y0 + rh / 2);
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 2;
      let prev;
      for (let k = 0; k < N; k++) {
        const v = vals[k], x0 = X(k), x1 = X(k + 1);
        if (v == null) {   // x：画一条斜纹带
          ctx.save(); ctx.beginPath(); ctx.rect(x0, hi, x1 - x0, lo - hi); ctx.clip();
          ctx.strokeStyle = P.mute; ctx.lineWidth = 1;
          for (let s = x0 - (lo - hi); s < x1; s += 6) { ctx.beginPath(); ctx.moveTo(s, lo); ctx.lineTo(s + (lo - hi), hi); ctx.stroke(); }
          ctx.restore(); ctx.strokeStyle = P.mute; ctx.lineWidth = 1; ctx.strokeRect(x0 + .5, hi, x1 - x0 - 1, lo - hi);
          ctx.strokeStyle = name in INPUT ? P.hand : name === 'y' ? P.ink : P.ok; ctx.lineWidth = 2; prev = null; continue;
        }
        const yy = v ? hi : lo;
        ctx.beginPath();
        if (prev != null && prev !== v) { ctx.moveTo(x0, prev ? hi : lo); ctx.lineTo(x0, yy); } else ctx.moveTo(x0, yy);
        ctx.lineTo(x1, yy); ctx.stroke();
        prev = v;
      }
      ctx.lineWidth = 1;
    });
    // 采样点：每个上升沿前一刻的 y
    r.edges.forEach(k => { const v = r.y[k - 1], yy = top + 3 * rh + (v ? 7 : rh - 7); ctx.fillStyle = P.ref; ctx.beginPath(); ctx.arc(X(k) - 3, yy, 3.2, 0, 7); ctx.fill(); });
    // 格号
    ctx.fillStyle = P.mute; ctx.font = '10px -apple-system, sans-serif'; ctx.textAlign = 'center';
    for (let k = 0; k < N; k++) ctx.fillText(k, X(k) + sw / 2, h - 8);
    text(r);
  }

  function text(r) {
    const asg = st.blocking ? '=' : '<=';
    code.innerHTML = [
      'module demo(input clk, a, b,',
      '  output y, output reg q1, q2);',
      `  <span class="hl-y">assign y = a ${st.op.replace('&', '&amp;')} b;</span>`,
      '  always @(posedge clk) begin',
      `    <span class="hl-q">q1 ${asg.replace('<', '&lt;')} y;</span>`,
      `    <span class="hl-q">q2 ${asg.replace('<', '&lt;')} q1;</span>`,
      '  end',
      'endmodule',
    ].join('\n');
    const n = r.edges.length, s = [];
    s.push(`y = a ${st.op} b（${OPNAME[st.op]}）每格都跟着输入变。`);
    if (!n) s.push('<b class="bad">一个上升沿都没有</b>，q1、q2 从头到尾都是 x：reg 上电时的值不确定，没被时钟写过就一直不确定。');
    else {
      s.push(`q1 只在 <b>${n} 个上升沿</b>（蓝色虚线）处更新，取的是沿之前那一格的 y（蓝点）。`);
      s.push(st.blocking
        ? '用阻塞赋值 <code>=</code>：<code>q2 = q1</code> 读到的是刚写进去的新值，<b class="bad">q2 和 q1 一模一样</b>，两级触发器塌成了一级。'
        : '<code>&lt;=</code> 是非阻塞赋值：两行同时生效，q2 拿到的是 q1 的旧值，所以 <b class="ok">q2 比 q1 晚一拍</b>。');
      const sampled = new Set(r.edges.map(k => k - 1));
      for (let i = 1; i < N - 1; i++) {
        if (r.y[i] === r.y[i - 1]) continue;
        let j = i; while (j + 1 < N && r.y[j + 1] === r.y[i]) j++;
        if (j + 1 < N && ![...Array(j - i + 1)].some((_, t) => sampled.has(i + t))) { s.push(`y 在第 ${i}${j > i ? `–${j}` : ''} 格变了一下又变回去，正好夹在两次采样之间，<b class="bad">寄存器根本没看见</b>。`); break; }
        i = j;
      }
    }
    out.innerHTML = s.join('<br>');
  }

  const at = e => {
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    const row = ROWS[Math.floor((y - g.top) / g.rh)], k = Math.floor((x - g.L) / g.sw);
    return row in INPUT && k >= 0 && k < N ? { row, k } : null;
  };
  cv.addEventListener('pointerdown', e => {
    const c = at(e); if (!c) return;
    paint = { row: c.row, v: st[c.row][c.k] ^ 1 }; st[c.row][c.k] = paint.v;
    cv.setPointerCapture(e.pointerId); draw();
  });
  cv.addEventListener('pointermove', e => {
    const c = at(e);
    if (paint) { if (c && c.row === paint.row && st[c.row][c.k] !== paint.v) { st[c.row][c.k] = paint.v; draw(); } return; }
    cv.style.cursor = c ? 'pointer' : 'default';
    if ((c?.row) !== hover?.row || c?.k !== hover?.k) { hover = c; draw(); }
  });
  const stop = () => { paint = null; };
  cv.addEventListener('pointerup', stop); cv.addEventListener('pointercancel', stop);
  cv.addEventListener('pointerleave', () => { if (!paint && hover) { hover = null; draw(); } });

  fig.api = {
    set(o = {}) {
      if (o.preset) Object.entries(PRESETS[o.preset]).forEach(([k, v]) => { st[k] = bits(v); });
      if (o.op) { st.op = o.op; setOp(o.op); }
      if (o.asg) { st.blocking = o.asg === '='; setAsg(o.asg); }
      draw(); flash(fig);
    },
  };
  setOp(st.op); setAsg('<=');
  onResize(cv, draw);
}
