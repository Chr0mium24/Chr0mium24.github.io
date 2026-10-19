// 首页小图：先验（红实线）固定，拖红虚线的测量左右走，看绿色的后验落在哪。
import { palette, canvas2d, drag, onResize, clamp, fmt } from '/assets/fig.js';
import { fuse } from './gauss.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  const m1 = -1.2, s1 = 1.2, s2 = 0.7, RT = Math.sqrt(2 * Math.PI);
  let m2 = 1.6, g;
  const pdf = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * RT);
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv), base = h - 10, X = x => w / 2 + x / 4.5 * (w / 2 - 6), Xi = px => (px - w / 2) / (w / 2 - 6) * 4.5, Y = v => base - v / 0.75 * (base - 14);
    g = { X, Xi, Y };
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(0, base); ctx.lineTo(w, base); ctx.stroke();
    const f = fuse(m1, s1, m2, s2);
    const curve = (m, s) => { ctx.beginPath(); for (let px = 0; px <= w; px += 2) { const y = Y(pdf(Xi(px), m, s)); px ? ctx.lineTo(px, y) : ctx.moveTo(px, y); } };
    curve(f.m, f.s); ctx.lineTo(w, base); ctx.lineTo(0, base); ctx.fillStyle = P.ok; ctx.globalAlpha = .22; ctx.fill(); ctx.globalAlpha = 1;
    curve(f.m, f.s); ctx.strokeStyle = P.ok; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = P.mute; ctx.lineWidth = 1.6; curve(m1, s1); ctx.stroke();
    ctx.strokeStyle = P.hand; ctx.setLineDash([5, 3]); curve(m2, s2); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
    const x = X(m2), y = Y(pdf(0, 0, s2));
    ctx.fillStyle = P.hand; ctx.globalAlpha = .16; ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.fill(); ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill();
    tag.textContent = `K = ${fmt(f.K, 2)}：后验落在 ${fmt(f.m)}，比两边都窄`;
  }
  drag(cv, { hit: (x, y) => Math.abs(x - g.X(m2)) < 40 && y < cv.clientHeight - 4 ? 1 : null, move: (_, x) => { m2 = clamp(g.Xi(x), -4, 4); draw(); } });
  onResize(cv, draw);
}
