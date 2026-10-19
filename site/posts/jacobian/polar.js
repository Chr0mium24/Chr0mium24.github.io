// 图：极坐标换元。左边 (r, θ) 平面的小方格，到右边 (x, y) 平面被拉成扇形。
// 拖红色的格子（左右两边都能拖），看面积比 → r，也就是 |J| = r。
import { palette, canvas2d, drag, onResize, clamp, flash } from '/assets/fig.js';

const RMAX = 2, TAU = Math.PI * 2;

export default function mount(fig) {
  const L = fig.querySelector('canvas.rt'), Rc = fig.querySelector('canvas.xy'), nIn = fig.querySelector('input[name=n]'), out = fig.querySelector('.readout');
  const st = { r: 1.2, t: 0.9, n: 8 };
  let gl, gr;
  const cell = () => {
    const dr = RMAX / st.n, dt = TAU / (st.n * 2);
    const i = clamp(Math.floor(st.r / dr), 0, st.n - 1), j = clamp(Math.floor(st.t / dt), 0, st.n * 2 - 1);
    return { dr, dt, r0: i * dr, t0: j * dt };
  };

  function draw() {
    const P = palette(fig), c = cell(), size = Math.min(L.clientWidth, 320);
    // 左：(r, θ) 平面，r 横着，θ 竖着
    {
      const { ctx, w, h } = canvas2d(L, size), pad = 26, X = r => pad + r / RMAX * (w - pad - 8), Y = t => h - pad - t / TAU * (h - pad - 8);
      gl = { X, Y, pad, w, h };
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = P.grid;
      for (let i = 0; i <= st.n; i++) { ctx.beginPath(); ctx.moveTo(X(i * c.dr), Y(0)); ctx.lineTo(X(i * c.dr), Y(TAU)); ctx.stroke(); }
      for (let j = 0; j <= st.n * 2; j++) { ctx.beginPath(); ctx.moveTo(X(0), Y(j * c.dt)); ctx.lineTo(X(RMAX), Y(j * c.dt)); ctx.stroke(); }
      ctx.strokeStyle = P.mute; ctx.strokeRect(X(0), Y(TAU), X(RMAX) - X(0), Y(0) - Y(TAU));
      ctx.fillStyle = P.hand; ctx.globalAlpha = .25; ctx.fillRect(X(c.r0), Y(c.t0 + c.dt), X(c.r0 + c.dr) - X(c.r0), Y(c.t0) - Y(c.t0 + c.dt)); ctx.globalAlpha = 1;
      ctx.strokeStyle = P.hand; ctx.lineWidth = 2; ctx.strokeRect(X(c.r0), Y(c.t0 + c.dt), X(c.r0 + c.dr) - X(c.r0), Y(c.t0) - Y(c.t0 + c.dt)); ctx.lineWidth = 1;
      ctx.fillStyle = P.mute; ctx.font = P.font; ctx.textAlign = 'center';
      ctx.fillText('r', X(RMAX) - 4, h - 8); ctx.fillText('0', X(0), h - 8); ctx.fillText('2', X(RMAX) - 16, h - 8);
      ctx.save(); ctx.translate(10, Y(TAU / 2)); ctx.rotate(-Math.PI / 2); ctx.fillText('θ：0 → 2π', 0, 0); ctx.restore();
    }
    // 右：(x, y) 平面
    {
      const { ctx, w, h } = canvas2d(Rc, size), cx = w / 2, cy = h / 2, k = (Math.min(w, h) / 2 - 10) / RMAX;
      gr = { cx, cy, k };
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = P.grid;
      for (let i = 1; i <= st.n; i++) { ctx.beginPath(); ctx.arc(cx, cy, i * c.dr * k, 0, TAU); ctx.stroke(); }
      for (let j = 0; j < st.n * 2; j++) { const t = j * c.dt; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + RMAX * k * Math.cos(t), cy - RMAX * k * Math.sin(t)); ctx.stroke(); }
      ctx.strokeStyle = P.mute; ctx.beginPath(); ctx.moveTo(cx - RMAX * k, cy); ctx.lineTo(cx + RMAX * k, cy); ctx.moveTo(cx, cy - RMAX * k); ctx.lineTo(cx, cy + RMAX * k); ctx.stroke();
      // 被拉成的扇形（真面积）
      ctx.beginPath(); ctx.arc(cx, cy, (c.r0 + c.dr) * k, -c.t0, -(c.t0 + c.dt), true); ctx.arc(cx, cy, c.r0 * k, -(c.t0 + c.dt), -c.t0, false); ctx.closePath();
      ctx.fillStyle = P.ok; ctx.globalAlpha = .3; ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = P.ok; ctx.lineWidth = 1.5; ctx.stroke(); ctx.lineWidth = 1;
      // 雅可比给的近似：在格子角上，两条切向量张成的平行四边形
      const r = c.r0, t = c.t0, ox = cx + r * k * Math.cos(t), oy = cy - r * k * Math.sin(t);
      const a = [Math.cos(t) * c.dr * k, -Math.sin(t) * c.dr * k], b = [-r * Math.sin(t) * c.dt * k, -r * Math.cos(t) * c.dt * k];
      ctx.setLineDash([4, 3]); ctx.strokeStyle = P.ref; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + a[0], oy + a[1]); ctx.lineTo(ox + a[0] + b[0], oy + a[1] + b[1]); ctx.lineTo(ox + b[0], oy + b[1]); ctx.closePath(); ctx.stroke();
      ctx.setLineDash([]); ctx.lineWidth = 1;
      ctx.fillStyle = P.hand; ctx.beginPath(); ctx.arc(cx + (r + c.dr / 2) * k * Math.cos(t + c.dt / 2), cy - (r + c.dr / 2) * k * Math.sin(t + c.dt / 2), 4, 0, TAU); ctx.fill();
      ctx.fillStyle = P.mute; ctx.font = P.font; ctx.textAlign = 'left'; ctx.fillText('x', w - 14, cy - 6); ctx.fillText('y', cx + 6, 12);
    }
    const before = c.dr * c.dt, after = (c.r0 + c.dr / 2) * c.dr * c.dt;
    out.innerHTML = `这一格 r 从 ${c.r0.toFixed(2)} 到 ${(c.r0 + c.dr).toFixed(2)}：左边面积 Δr·Δθ = ${before.toFixed(4)}，右边扇形面积 = ${after.toFixed(4)}，<b class="ok">比值 ${(after / before).toFixed(3)}</b>。` +
      `比值正好是格子中间的 r（${(c.r0 + c.dr / 2).toFixed(3)}）；格子越小，它越贴近格子所在处的 r，这就是 |J| = r。`;
    nIn.value = st.n; fig.querySelector('output[for=n]').textContent = `${st.n}×${st.n * 2}`;
  }

  drag(L, { hit: (x, y) => x > gl.pad - 4 && y < gl.h - gl.pad + 4 ? 1 : null, move: (_, x, y) => { st.r = clamp((x - gl.pad) / (gl.w - gl.pad - 8) * RMAX, 0, RMAX - 1e-6); st.t = clamp((gl.h - gl.pad - y) / (gl.h - gl.pad - 8) * TAU, 0, TAU - 1e-6); draw(); } });
  drag(Rc, { hit: (x, y) => Math.hypot(x - gr.cx, y - gr.cy) < RMAX * gr.k ? 1 : null, move: (_, x, y) => { const dx = (x - gr.cx) / gr.k, dy = (gr.cy - y) / gr.k; st.r = clamp(Math.hypot(dx, dy), 0, RMAX - 1e-6); st.t = (Math.atan2(dy, dx) + TAU) % TAU; draw(); } });
  nIn.addEventListener('input', () => { st.n = +nIn.value; draw(); });
  fig.api = { set(o = {}) { Object.assign(st, o); draw(); flash(fig); } };
  onResize(L, draw);
}
