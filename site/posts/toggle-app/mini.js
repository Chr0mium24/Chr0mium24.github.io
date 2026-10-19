// 首页小图：两个红色快捷键，一个走 osascript、一个走 Swift 二进制，按下去看窗口多久才藏起来/出来（时间是示意）。
import { palette, canvas2d, onResize } from '/assets/fig.js';

const KEYS = [{ label: 'osascript', ms: 905 }, { label: 'Swift', ms: 7 }];

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  let shown = true, busy = null, boxes = [], raf = 0;
  tag.textContent = '点一个快捷键（时间是示意）';
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv);
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    // 桌面上的一个窗口
    const wx = w * .08, wy = h * .1, ww = w * .5, wh = h * .55;
    ctx.strokeStyle = P.grid; ctx.strokeRect(wx - 6, wy - 6, ww + 12, wh + 12);
    if (shown) {
      ctx.fillStyle = P.bg; ctx.strokeStyle = P.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.roundRect(wx, wy, ww, wh, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = P.grid; ctx.fillRect(wx + 1, wy + 1, ww - 2, 16);
      [0, 1, 2].forEach(i => { ctx.fillStyle = P.mute; ctx.beginPath(); ctx.arc(wx + 10 + i * 9, wy + 9, 2.6, 0, 7); ctx.fill(); });
      ctx.fillStyle = P.ink; ctx.font = '600 12px -apple-system, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('微信', wx + ww / 2, wy + wh / 2 + 6);
    } else { ctx.fillStyle = P.mute; ctx.font = '12px -apple-system, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('（已隐藏）', wx + ww / 2, wy + wh / 2); }
    // 两个红键
    ctx.fillStyle = P.mute; ctx.font = '11px -apple-system, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('⌃⇧W 用哪个写的', w * .8, h * .1);
    boxes = KEYS.map((k, i) => ({ ...k, x: w * .65, y: h * .18 + i * h * .28, w: w * .3, h: h * .2 }));
    boxes.forEach(b => {
      const on = busy && busy.k === b;
      ctx.fillStyle = on ? P.hand : P.bg; ctx.strokeStyle = P.hand; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 8); ctx.fill(); ctx.stroke();
      if (on) { const p = Math.min(1, (performance.now() - busy.t0) / b.ms); ctx.fillStyle = '#fff'; ctx.globalAlpha = .35; ctx.fillRect(b.x + 2, b.y + b.h - 5, (b.w - 4) * p, 3); ctx.globalAlpha = 1; }
      ctx.fillStyle = on ? '#fff' : P.hand; ctx.font = '600 11px -apple-system, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2);
    });
  }
  function press(b) {
    if (busy) return;
    busy = { k: b, t0: performance.now() };
    const tick = () => {
      if (performance.now() - busy.t0 < b.ms) { draw(); raf = requestAnimationFrame(tick); return; }
      shown = !shown; tag.textContent = `${b.label}：≈ ${b.ms >= 100 ? (b.ms / 1000).toFixed(1) + ' s' : b.ms + ' ms'} 才${shown ? '出来' : '藏好'}（示意）`;
      busy = null; draw();
    };
    cancelAnimationFrame(raf); tick();
  }
  const at = e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; return boxes.find(b => x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h); };
  cv.addEventListener('pointerdown', e => { const b = at(e); if (b) press(b); });
  cv.addEventListener('pointermove', e => { cv.style.cursor = at(e) ? 'pointer' : 'default'; });
  onResize(cv, draw);
}
