// 首页小图：点左半边“转”，点右半边“翻”。
import { palette, canvas2d, onResize } from '/assets/fig.js';
import { press, name, matrix } from './d4.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  let g = [0, 0];
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv), M = matrix(g), cx = w / 2, cy = h * .46, a = h * .22;
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    ctx.setLineDash([3, 3]); ctx.strokeStyle = P.mute; ctx.strokeRect(cx - a, cy - a, 2 * a, 2 * a); ctx.setLineDash([]);
    const T = ([x, y]) => [cx + (M[0] * x + M[1] * y) * a, cy - (M[2] * x + M[3] * y) * a];
    const c = [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(T);
    ctx.beginPath(); c.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.strokeStyle = P.ink; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1;
    const f = [[-.55, .55], [.05, .55], [-.55, -.1]].map(T);
    ctx.beginPath(); f.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fillStyle = P.ok; ctx.globalAlpha = .35; ctx.fill(); ctx.globalAlpha = 1;
    ctx.font = '600 12px -apple-system, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = P.ink;
    [[-1.3, 1.3], [1.3, 1.3], [1.3, -1.3], [-1.3, -1.3]].map(T).forEach(([x, y], i) => ctx.fillText(i + 1, x, y + 4));
    // 两个红按钮
    [['转 r', w * .12], ['翻 s', w * .88]].forEach(([t, x]) => {
      ctx.strokeStyle = P.hand; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(x - 24, cy - 13, 48, 26, 13); ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = P.hand; ctx.fillText(t, x, cy + 4);
    });
    tag.textContent = `现在：${name(g)}`;
  }
  cv.style.cursor = 'pointer';
  cv.addEventListener('pointerdown', e => { const b = cv.getBoundingClientRect(); g = press(g, e.clientX - b.left < b.width / 2 ? 'r' : 's'); draw(); });
  onResize(cv, draw);
}
