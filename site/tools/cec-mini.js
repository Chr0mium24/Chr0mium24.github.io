// 工具卡片的小图：一张二维码的轮廓，旁边一圈 5 秒的刷新进度；点红色的“刷新”立刻换一张。
import { palette, canvas2d, onResize } from '/assets/fig.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  const N = 21, PERIOD = 5000;
  let seed = 7, t0 = performance.now(), n = 1, btn = null, raf;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  let cells = make();
  function make() {
    const m = Array.from({ length: N }, () => Array.from({ length: N }, () => rnd() < .46));
    const finder = (r, c) => { for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) m[r + i][c + j] = i === 0 || i === 6 || j === 0 || j === 6 || (i > 1 && i < 5 && j > 1 && j < 5); for (let i = -1; i < 8; i++) for (let j = -1; j < 8; j++) if (m[r + i]?.[c + j] !== undefined && (i === -1 || i === 7 || j === -1 || j === 7)) m[r + i][c + j] = false; };
    finder(0, 0); finder(0, N - 7); finder(N - 7, 0);
    return m;
  }
  function draw(now = performance.now()) {
    const P = palette(el), { ctx, w, h } = canvas2d(cv);
    const p = ((now - t0) % PERIOD) / PERIOD;
    if (now - t0 >= PERIOD) { t0 = now - ((now - t0) % PERIOD); cells = make(); n++; }
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    const s = Math.min(h - 28, w * .5), u = s / N, x0 = w * .3 - s / 2, y0 = (h - s) / 2 - 4;
    ctx.fillStyle = P.ink;
    cells.forEach((row, r) => row.forEach((on, c) => { if (on) ctx.fillRect(x0 + c * u, y0 + r * u, u + .3, u + .3); }));
    // 进度环
    const cx = w * .74, cy = h / 2 - 4, R = Math.min(h * .26, 34);
    ctx.lineWidth = 5; ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.strokeStyle = P.ok; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke();
    ctx.fillStyle = P.ink; ctx.font = '600 13px -apple-system, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${(5 - p * 5).toFixed(1)}s`, cx, cy);
    // 红色刷新按钮
    const bw = 52, bh = 22, bx = cx - bw / 2, by = cy + R + 10;
    btn = { x: bx, y: by, w: bw, h: bh };
    ctx.lineWidth = 1.4; ctx.strokeStyle = P.hand; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 11); ctx.stroke();
    ctx.fillStyle = P.hand; ctx.font = '12px -apple-system, sans-serif'; ctx.fillText('刷新', cx, by + bh / 2 + .5);
    tag.textContent = `第 ${n} 张 · 每 5 秒换一张`;
  }
  const loop = now => { draw(now); raf = requestAnimationFrame(loop); };
  // 看得见才转，省电
  new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e.isIntersecting && !matchMedia('(prefers-reduced-motion: reduce)').matches) raf = requestAnimationFrame(loop); else draw(); }).observe(el);
  const hit = e => { const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; return btn && x >= btn.x - 6 && x <= btn.x + btn.w + 6 && y >= btn.y - 6 && y <= btn.y + btn.h + 6; };
  cv.addEventListener('pointermove', e => cv.style.cursor = hit(e) ? 'pointer' : 'default');
  cv.addEventListener('pointerdown', e => { if (!hit(e)) return; t0 = performance.now(); cells = make(); n++; draw(); });
  onResize(cv, () => draw());
}
