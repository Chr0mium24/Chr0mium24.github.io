// 首页小图：12 个点和它们的 OLS 直线。拖那个红点，看一个点能把整条线掰多远。
import { palette, canvas2d, drag, onResize, clamp, fmt } from '/assets/fig.js';
import { rng, gauss, quick } from './stats.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  const r = rng(11), pts = Array.from({ length: 12 }, (_, i) => { const x = 0.5 + i * 0.8; return { x, y: 1 + 0.5 * x + 0.6 * gauss(r) }; });
  const hand = pts[11]; hand.y = 1;   // 右边那个点先拽下来一点
  let g;
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv), X = x => 10 + x / 10 * (w - 20), Y = y => h - 12 - (y + 1) / 9 * (h - 24);
    g = { X, Y, Xi: px => (px - 10) / (w - 20) * 10, Yi: py => (h - 12 - py) / (h - 24) * 9 - 1 };
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    const q = quick(pts);
    ctx.strokeStyle = P.ref; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(0), Y(1)); ctx.lineTo(X(10), Y(6)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = P.ok; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), Y(q.a)); ctx.lineTo(X(10), Y(q.a + 10 * q.b)); ctx.stroke(); ctx.lineWidth = 1;
    pts.forEach(p => { if (p === hand) return; ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 3, 0, 7); ctx.fill(); });
    ctx.fillStyle = P.hand; ctx.globalAlpha = .18; ctx.beginPath(); ctx.arc(X(hand.x), Y(hand.y), 11, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(X(hand.x), Y(hand.y), 5, 0, 7); ctx.fill();
    tag.textContent = `斜率 ${fmt(q.b, 2)}（真值 0.5）：一个点就能掰动整条线`;
  }
  drag(cv, { hit: (x, y) => Math.hypot(x - g.X(hand.x), y - g.Y(hand.y)) < 16 ? 1 : null, move: (_, x, y) => { hand.x = clamp(g.Xi(x), 0, 10); hand.y = clamp(g.Yi(y), -1, 8); draw(); } });
  onResize(cv, draw);
}
