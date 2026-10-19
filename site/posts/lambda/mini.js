// 首页小图：拖红点改 n，看 Church 数 n = 把 f 用 n 次。
import { palette, canvas2d, drag, onResize, clamp } from '/assets/fig.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  let n = 3, g;
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv);
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    // 上：x → f → f → … 一条链
    const cy = h * .38, step = Math.min(34, (w - 60) / Math.max(n, 1));
    ctx.font = '600 13px ' + 'SF Mono, Menlo, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let x = 22; ctx.fillStyle = P.ink; ctx.fillText('x', x, cy);
    for (let i = 0; i < n; i++) {
      x += step;
      ctx.strokeStyle = P.mute; ctx.beginPath(); ctx.moveTo(x - step + 9, cy); ctx.lineTo(x - 13, cy); ctx.stroke();
      ctx.fillStyle = P.ok; ctx.globalAlpha = .16; ctx.beginPath(); ctx.roundRect(x - 11, cy - 11, 22, 22, 5); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = P.ok; ctx.fillText('f', x, cy);
    }
    // 下：0..8 的数轴，红点是 n
    const ay = h - 26, X = k => 20 + k / 8 * (w - 40);
    g = { X };
    ctx.strokeStyle = P.mute; ctx.beginPath(); ctx.moveTo(X(0), ay); ctx.lineTo(X(8), ay); ctx.stroke();
    ctx.font = '10px -apple-system, sans-serif'; ctx.fillStyle = P.mute;
    for (let k = 0; k <= 8; k++) { ctx.fillRect(X(k) - .5, ay - 3, 1, 6); }
    ctx.fillStyle = P.hand; ctx.globalAlpha = .18; ctx.beginPath(); ctx.arc(X(n), ay, 11, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(X(n), ay, 5.5, 0, 7); ctx.fill();
    tag.textContent = n === 0 ? 'ZERO = λf.λx. x' : `${n} = λf.λx. ${n > 4 ? `f(…f(x)…)，${n} 个 f` : 'f('.repeat(n) + 'x' + ')'.repeat(n)}`;
  }
  drag(cv, { hit: (x, y) => y > cv.clientHeight - 48 ? 1 : null, move: (_, x) => { n = clamp(Math.round((x - 20) / (cv.clientWidth - 40) * 8), 0, 8); draw(); } });
  onResize(cv, draw);
}
