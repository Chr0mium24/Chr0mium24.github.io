// 首页小图：一个 NAND 门，点两个红开关。
import { palette, canvas2d, onResize } from '/assets/fig.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  const st = { A: 1, B: 1 };
  let hits = [];
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv), o = (st.A && st.B) ? 0 : 1;
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    const gx = w * .5, gy = h * .42, gw = 46, gh = 44, ys = { A: gy - gh * .25, B: gy + gh * .25 };
    hits = [];
    ['A', 'B'].forEach(k => {
      const v = st[k], sy = k === 'A' ? gy - 32 : gy + 32, sx = w * .12;
      ctx.strokeStyle = v ? P.ok : P.mute; ctx.lineWidth = v ? 2.4 : 1.4;
      ctx.beginPath(); ctx.moveTo(sx + 40, sy); ctx.lineTo(gx - gw / 2 - 14, sy); ctx.lineTo(gx - gw / 2 - 14, ys[k]); ctx.lineTo(gx - gw / 2, ys[k]); ctx.stroke();
      ctx.fillStyle = v ? P.hand : P.bg; ctx.strokeStyle = P.hand; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.roundRect(sx, sy - 12, 40, 24, 12); ctx.fill(); ctx.stroke();
      ctx.fillStyle = v ? '#fff' : P.hand; ctx.font = '600 11px -apple-system, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(`${k}=${v}`, sx + 20, sy + .5);
      hits.push({ k, x: sx, y: sy - 12, w: 40, h: 24 });
    });
    ctx.strokeStyle = o ? P.ok : P.mute; ctx.lineWidth = o ? 2.4 : 1.4;
    ctx.beginPath(); ctx.moveTo(gx + gw / 2 + gh / 2 + 7, gy); ctx.lineTo(w * .82, gy); ctx.stroke();
    const x = gx - gw / 2, y = gy - gh / 2;
    ctx.fillStyle = P.bg; ctx.strokeStyle = P.ink; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + gw / 2, y); ctx.arc(x + gw / 2, gy, gh / 2, -Math.PI / 2, Math.PI / 2); ctx.lineTo(x, y + gh); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + gw / 2 + gh / 2 + 3.5, gy, 3.5, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = o ? P.ok : P.bg; ctx.strokeStyle = o ? P.ok : P.mute; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(w * .82 + 10, gy, 10, 0, 7); ctx.fill(); ctx.stroke();
    tag.textContent = `NAND(${st.A}, ${st.B}) = ${o}`;
  }
  cv.addEventListener('pointerdown', e => {
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    const t = hits.find(s => x >= s.x - 6 && x <= s.x + s.w + 6 && y >= s.y - 6 && y <= s.y + s.h + 6);
    if (t) { st[t.k] ^= 1; draw(); }
  });
  cv.addEventListener('pointermove', e => {
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    cv.style.cursor = hits.some(s => x >= s.x - 6 && x <= s.x + s.w + 6 && y >= s.y - 6 && y <= s.y + s.h + 6) ? 'pointer' : 'default';
  });
  onResize(cv, draw);
}
