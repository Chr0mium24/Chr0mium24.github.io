// 首页小图：主动学习挑的点全贴着决策边界。左右拖改标注预算。
import { palette, canvas2d, drag, onResize, clamp } from '/assets/fig.js';
import { run, prob } from './al.js';
import { shade } from './boundary.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  const R = run({ seed: 7, k: 5 });
  let i = 4;
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv), hA = R.al[i];
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    const s = Math.min(w, h * 1.6) / 2, cx = w / 2, cy = h / 2, X = x => cx + x * s, Y = y => cy - y * s / 1.6;
    const G = 40, off = shade(P, G, (a, b) => prob(hA.w, (a + .5) / G * 2 - 1, 1 - (b + .5) / G * 2), .35);
    ctx.imageSmoothingEnabled = true; ctx.drawImage(off, X(-1), Y(1), 2 * s, 2 * s / 1.6);
    const lab = new Set(hA.labeled), fresh = new Set(hA.picked);
    R.pool.forEach((d, j) => {
      if (!lab.has(j)) { ctx.fillStyle = P.mute; ctx.globalAlpha = .4; ctx.fillRect(X(d.x) - .7, Y(d.y) - .7, 1.4, 1.4); ctx.globalAlpha = 1; return; }
      ctx.fillStyle = d.c ? P.ink : P.ref; ctx.beginPath(); ctx.arc(X(d.x), Y(d.y), 2.6, 0, 7); ctx.fill();
      if (fresh.has(j) && i) { ctx.strokeStyle = P.ok; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(X(d.x), Y(d.y), 5, 0, 7); ctx.stroke(); ctx.lineWidth = 1; }
    });
    tag.textContent = `主动学习 · 标 ${hA.n} 张 · 准确率 ${(hA.acc * 100).toFixed(0)}%`;
  }
  drag(cv, { hit: () => 1, move: (_, x) => { const j = clamp(Math.round(x / cv.clientWidth * (R.al.length - 1)), 0, R.al.length - 1); if (j !== i) { i = j; draw(); } } });
  onResize(cv, draw);
}
