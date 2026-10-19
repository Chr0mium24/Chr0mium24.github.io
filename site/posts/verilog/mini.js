// 首页小图：点红色的 d 波形翻转某一格，看寄存器 q 只在时钟上升沿才跟上。
import { palette, canvas2d, onResize } from '/assets/fig.js';
import { sim } from './sim.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  const N = 10, clk = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1], d = [0, 1, 1, 0, 0, 0, 1, 0, 0, 0], one = Array(N).fill(1);
  let g;
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv), L = 26, sw = (w - L - 10) / N, rh = Math.min(30, (h - 34) / 3), top = 10;
    g = { L, sw, rh, top };
    const r = sim({ a: d, b: one, clk });
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    r.edges.forEach(k => { ctx.strokeStyle = P.ref; ctx.globalAlpha = .6; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(L + k * sw, top); ctx.lineTo(L + k * sw, top + 3 * rh); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; });
    [['clk', clk, P.mute], ['d', d, P.hand], ['q', r.q1, P.ok]].forEach(([name, v, col], i) => {
      const y0 = top + i * rh, hi = y0 + 6, lo = y0 + rh - 6;
      ctx.fillStyle = col; ctx.font = '600 11px SF Mono, Menlo, monospace'; ctx.textBaseline = 'middle'; ctx.fillText(name, 4, y0 + rh / 2);
      ctx.strokeStyle = col; ctx.lineWidth = 2; let prev = null;
      for (let k = 0; k < N; k++) {
        const x0 = L + k * sw, x1 = x0 + sw;
        if (v[k] == null) { ctx.lineWidth = 1; ctx.strokeStyle = P.mute; ctx.strokeRect(x0 + .5, hi, sw - 1, lo - hi); ctx.strokeStyle = col; ctx.lineWidth = 2; prev = null; continue; }
        const yy = v[k] ? hi : lo; ctx.beginPath();
        if (prev != null && prev !== v[k]) { ctx.moveTo(x0, prev ? hi : lo); ctx.lineTo(x0, yy); } else ctx.moveTo(x0, yy);
        ctx.lineTo(x1, yy); ctx.stroke(); prev = v[k];
      }
      ctx.lineWidth = 1;
    });
    const sampled = new Set(r.edges.map(k => k - 1)), missed = d.some((v, k) => v && !sampled.has(k) && !d[k - 1] && !d[k + 1]);
    const flips = v => v.reduce((n, x, k) => n + (k && x != null && v[k - 1] != null && x !== v[k - 1] ? 1 : 0), 0);
    tag.textContent = missed ? 'd 在两个上升沿之间闪了一下，q 没看见' : `d 变了 ${flips(d)} 次，q 只在上升沿跟，变了 ${flips(r.q1)} 次`;
  }
  const cell = e => { const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top, k = Math.floor((x - g.L) / g.sw); return y > g.top + g.rh - 4 && y < g.top + 2 * g.rh + 4 && k >= 0 && k < N ? k : -1; };
  cv.addEventListener('pointerdown', e => { const k = cell(e); if (k >= 0) { d[k] ^= 1; draw(); } });
  cv.addEventListener('pointermove', e => { cv.style.cursor = cell(e) >= 0 ? 'pointer' : 'default'; });
  onResize(cv, draw);
}
