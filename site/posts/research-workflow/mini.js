// 首页小图：三页论文，指针移到第几页就看第几遍读哪些块。
import { palette, canvas2d, onResize } from '/assets/fig.js';
import { PASSES, drawPages } from './paper.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  let pass = 0;
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv);
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    const gap = 8, pw = Math.min((w - 24 - gap * 2) / 3, (h - 36) / 1.32);
    drawPages(ctx, P, { x: (w - pw * 3 - gap * 2) / 2, y: Math.max(6, (h - 26 - pw * 1.32) / 2), w: pw * 3 + gap * 2, h: pw * 1.32 }, pass, null, gap);
    tag.textContent = `${PASSES[pass].name} · ${PASSES[pass].time}`;
  }
  const pick = e => { const b = cv.getBoundingClientRect(), p = Math.min(2, Math.max(0, Math.floor((e.clientX - b.left) / b.width * 3))); if (p !== pass) { pass = p; draw(); } };
  cv.addEventListener('pointermove', pick);
  cv.addEventListener('pointerdown', pick);
  onResize(cv, draw);
}
