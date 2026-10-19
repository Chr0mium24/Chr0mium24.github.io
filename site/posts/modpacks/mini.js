// 首页小图：十个包的模组数，拖红线定“电脑扛得住的上限”。
import { palette, canvas2d, drag, onResize, clamp } from '/assets/fig.js';
import { PACKS } from './packs.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  const rows = PACKS.filter(p => p.mods).sort((a, b) => b.mods - a.mods);
  let cap = 300, g;
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv), L = 12, R = 14, top = 10, bh = (h - top - 30) / rows.length;
    const X = v => L + v / 550 * (w - L - R);
    g = { X, L, R };
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    rows.forEach((p, i) => {
      const y = top + i * bh, fit = p.mods <= cap;
      ctx.fillStyle = fit ? P.ok : P.mute; ctx.globalAlpha = fit ? .85 : .3;
      ctx.beginPath(); ctx.roundRect(X(0), y + 2, X(p.mods) - X(0), bh - 4, [0, 3, 3, 0]); ctx.fill(); ctx.globalAlpha = 1;
    });
    ctx.strokeStyle = P.hand; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(cap), top - 4); ctx.lineTo(X(cap), h - 26); ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = P.hand; ctx.beginPath(); ctx.arc(X(cap), h - 26, 5, 0, 7); ctx.fill();
    tag.textContent = `≤ ${cap} 个模组：${rows.filter(p => p.mods <= cap).length} 个包`;
  }
  drag(cv, { hit: () => 1, move: (_, x) => { cap = clamp(Math.round((x - g.L) / (cv.clientWidth - g.L - g.R) * 550 / 10) * 10, 100, 550); draw(); } });
  onResize(cv, draw);
}
