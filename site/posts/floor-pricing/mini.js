// 首页小图：(p, F) 对数平面上的分界线 pF = ΔC。拖红点，看期望罚追不追得上省下的钱。
import { palette, canvas2d, drag, onResize, clamp } from '/assets/fig.js';
import { money } from './price.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  const dc = 1000, lg = Math.log10;
  let p = 0.01, F = 4e4, g;
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv);
    const X = v => 8 + (lg(v) + 3) / 3 * (w - 16), Y = v => h - 8 - (lg(v) - 2) / 5 * (h - 16);
    g = { X, Y, Xi: px => 10 ** ((px - 8) / (w - 16) * 3 - 3), Yi: py => 10 ** (2 + (h - 8 - py) / (h - 16) * 5) };
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    ctx.beginPath(); ctx.moveTo(X(1e-3), Y(1e6)); ctx.lineTo(X(1), Y(1e3)); ctx.lineTo(X(1), Y(1e7)); ctx.lineTo(X(1e-3), Y(1e7)); ctx.closePath();
    ctx.fillStyle = P.ok; ctx.globalAlpha = .14; ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = P.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(1e-3), Y(1e6)); ctx.lineTo(X(1), Y(1e3)); ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = P.hand; ctx.globalAlpha = .18; ctx.beginPath(); ctx.arc(X(p), Y(F), 11, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(X(p), Y(F), 5.5, 0, 7); ctx.fill();
    const pen = p * F;
    tag.textContent = pen < dc ? `期望罚 ${money(pen)} 元 < 省下的 1,000 元：违规划算` : `期望罚 ${money(pen)} 元 ≥ 省下的 1,000 元：不划算`;
  }
  drag(cv, { hit: (x, y) => Math.hypot(x - g.X(p), y - g.Y(F)) < 26 ? 1 : null, move: (_, x, y) => { p = clamp(g.Xi(x), 1e-3, 1); F = clamp(g.Yi(y), 100, 1e7); draw(); } });
  onResize(cv, draw);
}
