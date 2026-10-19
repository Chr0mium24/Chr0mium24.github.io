// 首页小图：(e, ė) 相平面。拖红点换初始状态，看轨迹先冲向滑模面 s = 0，再沿着它滑回原点。
import { palette, canvas2d, drag, onResize, clamp, fmt } from '/assets/fig.js';
import { simulate, N } from './sim.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  const E = 1.4, ED = 2.8, c = 2;
  let e0 = [-1, 0.6], g;
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv), res = simulate({ mode: 'bl', K: 6, c, phi: 0.1, D: 1.5, sig: 0, ref: 'step', e0 });
    const k = Math.min((w - 12) / (2 * E), (h - 12) / (2 * ED) * 2), X = e => w / 2 + e * k, Y = d => h / 2 - d * k / 2;
    g = { X, Y, k };
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(w, Y(0)); ctx.moveTo(X(0), 0); ctx.lineTo(X(0), h); ctx.stroke();
    ctx.strokeStyle = P.ref; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(-3), Y(3 * c)); ctx.lineTo(X(3), Y(-3 * c)); ctx.stroke();
    ctx.strokeStyle = P.ok; ctx.lineWidth = 1.8; ctx.beginPath();
    for (let i = 0; i < N; i += 4) { const x = X(res.e[i]), y = Y(res.ed[i]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = P.hand; ctx.globalAlpha = .16; ctx.beginPath(); ctx.arc(X(e0[0]), Y(e0[1]), 11, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(X(e0[0]), Y(e0[1]), 5.5, 0, 7); ctx.fill();
    tag.textContent = Math.abs(c * e0[0] + e0[1]) < 0.05 ? '起点就在滑模面上：直接沿 s = 0 滑回原点' : `${fmt(res.reach, 2)} s 冲上 s = 0，再沿它滑回原点`;
  }
  drag(cv, {
    hit: (x, y) => Math.hypot(x - g.X(e0[0]), y - g.Y(e0[1])) < 16 ? 1 : null,
    move: (_, x, y) => { e0 = [clamp((x - cv.clientWidth / 2) / g.k, -E, E), clamp((cv.clientHeight / 2 - y) / g.k * 2, -ED, ED)]; draw(); },
  });
  onResize(cv, draw);
}
