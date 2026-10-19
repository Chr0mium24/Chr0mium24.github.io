// 首页小图：极坐标网格，拖着选一格，看它离原点越远越大。
import { palette, canvas2d, drag, onResize } from '/assets/fig.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  const n = 6, dr = 2 / n, dt = Math.PI * 2 / 16;
  let r = 1.4, t = .5, g;
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv), cx = w / 2, cy = h / 2, k = (h / 2 - 8) / 2;
    g = { cx, cy, k };
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = P.grid;
    for (let i = 1; i <= n; i++) { ctx.beginPath(); ctx.arc(cx, cy, i * dr * k, 0, 7); ctx.stroke(); }
    for (let j = 0; j < 16; j++) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 2 * k * Math.cos(j * dt), cy - 2 * k * Math.sin(j * dt)); ctx.stroke(); }
    const r0 = Math.min(n - 1, Math.floor(r / dr)) * dr, t0 = Math.floor(t / dt) * dt;
    ctx.beginPath(); ctx.arc(cx, cy, (r0 + dr) * k, -t0, -(t0 + dt), true); ctx.arc(cx, cy, r0 * k, -(t0 + dt), -t0); ctx.closePath();
    ctx.fillStyle = P.hand; ctx.globalAlpha = .3; ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = P.hand; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1;
    tag.textContent = `这格面积 ≈ ${(r0 + dr / 2).toFixed(2)} × ΔrΔθ`;
  }
  drag(cv, { hit: (x, y) => Math.hypot(x - g.cx, y - g.cy) < 2 * g.k ? 1 : null, move: (_, x, y) => { const dx = (x - g.cx) / g.k, dy = (g.cy - y) / g.k; r = Math.min(1.999, Math.hypot(dx, dy)); t = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2); draw(); } });
  onResize(cv, draw);
}
