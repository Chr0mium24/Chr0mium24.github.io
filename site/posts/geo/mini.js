// 首页小图：拖下面的红点改 z，看部分和收敛（绿）还是发散（灰）。a 固定 0.5。
import { palette, canvas2d, drag, onResize, clamp } from '/assets/fig.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  const a = .5, Z0 = .15, Z1 = 2.4;
  let z = 2, g;
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv);
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    const q = a / z, ok = z > a, S = []; let s = 0, t = 1; for (let n = 0; n < 10; n++) { s += t; S.push(s); t *= q; }
    const closed = 1 / (1 - q);
    // 上半部分：部分和柱子；虚线是闭式（只在 ROC 里画，外面它说谎）
    const top = 14, bot = h - 46, pad = 14, bw = (w - pad * 2) / S.length, hi = Math.max(...S, ok ? closed : 0, 2);
    const y = v => bot - v / hi * (bot - top);
    S.forEach((v, n) => { ctx.fillStyle = ok ? P.ok : P.mute; ctx.fillRect(pad + n * bw + 2, y(v), bw - 4, bot - y(v)); });
    if (ok) { ctx.strokeStyle = P.ink; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(pad, y(closed)); ctx.lineTo(w - pad, y(closed)); ctx.stroke(); ctx.setLineDash([]); }
    // 下面：z 轴，灰的那段是 ROC 外
    const ay = h - 24, X = v => pad + (v - Z0) / (Z1 - Z0) * (w - pad * 2);
    g = { X, ay, pad };
    ctx.strokeStyle = P.mute; ctx.beginPath(); ctx.moveTo(pad, ay); ctx.lineTo(w - pad, ay); ctx.stroke();
    ctx.strokeStyle = P.ok; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X(a), ay); ctx.lineTo(w - pad, ay); ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = P.hand; ctx.globalAlpha = .18; ctx.beginPath(); ctx.arc(X(z), ay, 11, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(X(z), ay, 5.5, 0, 7); ctx.fill();
    tag.textContent = ok ? `z = ${z.toFixed(2)}：收敛到 ${closed.toFixed(2)}` : `z = ${z.toFixed(2)}：发散，闭式却给 ${closed.toFixed(1)}`;
  }
  drag(cv, { hit: (x, y) => Math.abs(y - g.ay) < 22 ? 1 : null, move: (_, x) => { z = clamp(Z0 + (x - g.pad) / (cv.clientWidth - g.pad * 2) * (Z1 - Z0), Z0, Z1); draw(); } });
  onResize(cv, draw);
}
