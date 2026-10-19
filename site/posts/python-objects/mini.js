// 首页小图：5 ⇢ int ⇢ type ⇢ type……点一个（红框）看 type(它) 是谁，到 type 就绕回自己。
import { palette, canvas2d, onResize } from '/assets/fig.js';

const NODES = ['5', 'int', 'type'];
const SAY = { 5: 'type(5) 是 int', int: 'type(int) 是 type：类也是对象', type: 'type(type) 还是 type，到头了' };

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  let pick = 1, boxes = [];
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv), cy = h * .44;
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    ctx.font = '600 14px SF Mono, Menlo, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    boxes = NODES.map((k, i) => { const cx = w * (.17 + i * .3), bw = Math.max(40, ctx.measureText(k).width + 22); return { k, cx, x: cx - bw / 2, y: cy - 15, w: bw, h: 30 }; });
    // 虚线：x ⇢ type(x)
    boxes.forEach((b, i) => {
      const on = i === pick;
      ctx.strokeStyle = on ? P.ok : P.mute; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = on ? 2.4 : 1.2; ctx.setLineDash([5, 4]);
      if (i < 2) {
        const x0 = b.x + b.w + 4, x1 = boxes[i + 1].x - 4;
        ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(x1, cy); ctx.lineTo(x1 - 8, cy - 4); ctx.lineTo(x1 - 8, cy + 4); ctx.closePath(); ctx.fill();
      } else {
        const x = b.x + b.w;
        ctx.beginPath(); ctx.moveTo(x - 10, b.y - 2); ctx.bezierCurveTo(x - 8, b.y - 30, x + 30, cy - 12, x + 4, cy); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(x + 4, cy); ctx.lineTo(x + 13, cy - 4); ctx.lineTo(x + 10, cy + 6); ctx.closePath(); ctx.fill();
      }
    });
    boxes.forEach((b, i) => {
      const on = i === pick;
      ctx.fillStyle = on ? P.hand : P.bg; ctx.strokeStyle = P.hand; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, i ? 6 : 15); ctx.fill(); ctx.stroke();
      ctx.fillStyle = on ? '#fff' : P.ink; ctx.fillText(b.k, b.cx, cy + .5);
    });
    ctx.font = P.font; ctx.fillStyle = P.mute;
    ['实例', '类', '元类'].forEach((t, i) => ctx.fillText(t, boxes[i].cx, cy + 32));
    tag.textContent = SAY[NODES[pick]];
  }
  const hit = e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; return boxes.findIndex(b => x > b.x - 8 && x < b.x + b.w + 8 && y > b.y - 10 && y < b.y + b.h + 10); };
  cv.addEventListener('pointerdown', e => { const i = hit(e); if (i >= 0) { pick = i; draw(); } });
  cv.addEventListener('pointermove', e => { cv.style.cursor = hit(e) >= 0 ? 'pointer' : 'default'; });
  onResize(cv, draw);
}
