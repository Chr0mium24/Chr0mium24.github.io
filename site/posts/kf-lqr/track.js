// 图：一维卡尔曼跟踪随机游走。拖 Q、R 两个滑块（对数刻度），看估计曲线和增益 K 怎么收敛。
// 下面那栏同时画对偶的 LQR 增益：同一个 Riccati 递推，K 从第 0 步往后算，L 从第 N 步往前算。
import { palette, canvas2d, onResize, flash, fmt } from '/assets/fig.js';

export const N = 120, QT = 0.05, RT = 1, P0 = 4;
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const gauss = r => { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };

export function world(seed) {
  const r = rng(seed), x = [], z = []; let v = 1.5;
  for (let k = 0; k < N; k++) { if (k) v += Math.sqrt(QT) * gauss(r); x.push(v); z.push(v + Math.sqrt(RT) * gauss(r)); }
  return { x, z };
}
// 一维：A = H = 1。返回每一步的后验 x̂、P 和增益 K
export function filter(z, Q, R) {
  let xh = 0, Pm = P0; const est = [], P = [], K = [];
  for (let k = 0; k < z.length; k++) {
    if (k) Pm = P[k - 1] + Q;
    const g = Pm / (Pm + R); xh = xh + g * (z[k] - xh);
    est.push(xh); P.push((1 - g) * Pm); K.push(g);
  }
  return { est, P, K };
}
// 对偶的 LQR：x_{k+1} = x_k + u_k，代价 Σ Q x² + R u²，终端 P_N = P0；u_k = −L_k x_k
export function lqr(Q, R) { const L = new Array(N); let P = P0; for (let k = N - 1; k >= 0; k--) { L[k] = P / (R + P); P = Q + R * P / (R + P); } return L; }
export const Kinf = (Q, R) => { const Pm = (Q + Math.sqrt(Q * Q + 4 * Q * R)) / 2; return Pm / (Pm + R); };

export default function mount(fig) {
  const cv = fig.querySelector('canvas.track'), gc = fig.querySelector('canvas.gain'), out = fig.querySelector('.readout');
  const qIn = fig.querySelector('input[name=q]'), rIn = fig.querySelector('input[name=r]');
  const st = { Q: QT, R: RT, seed: 3 };
  let W = world(st.seed);

  function draw() {
    const P = palette(fig), f = filter(W.z, st.Q, st.R), L = lqr(st.Q, st.R), Ki = Kinf(st.Q, st.R);
    qIn.value = Math.log10(st.Q); rIn.value = Math.log10(st.R);
    fig.querySelector('output[for=q]').textContent = fmtv(st.Q); fig.querySelector('output[for=r]').textContent = fmtv(st.R);
    // ---- 跟踪 ----
    {
      const { ctx, w, h } = canvas2d(cv, 250), l = 30, r = 8, t = 10, b = h - 22;
      let lo = Infinity, hi = -Infinity; W.x.concat(W.z).forEach(v => { lo = Math.min(lo, v); hi = Math.max(hi, v); }); lo -= .3; hi += .3;
      const X = k => l + k / (N - 1) * (w - l - r), Y = v => b - (v - lo) / (hi - lo) * (b - t);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h); ctx.font = P.font;
      ctx.strokeStyle = P.grid; ctx.fillStyle = P.mute; ctx.textAlign = 'right';
      for (let v = Math.ceil(lo); v <= hi; v++) { ctx.beginPath(); ctx.moveTo(l, Y(v)); ctx.lineTo(w - r, Y(v)); ctx.stroke(); ctx.fillText(v, l - 5, Y(v) + 4); }
      ctx.textAlign = 'center'; for (let k = 0; k < N; k += 20) ctx.fillText(k, X(k), h - 6);
      // ±2σ 带
      ctx.beginPath(); f.est.forEach((v, k) => ctx.lineTo(X(k), Y(v + 2 * Math.sqrt(f.P[k])))); for (let k = N - 1; k >= 0; k--) ctx.lineTo(X(k), Y(f.est[k] - 2 * Math.sqrt(f.P[k])));
      ctx.closePath(); ctx.fillStyle = P.ok; ctx.globalAlpha = .13; ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = P.mute; W.z.forEach((v, k) => { ctx.beginPath(); ctx.arc(X(k), Y(v), 1.8, 0, 7); ctx.fill(); });
      ctx.strokeStyle = P.ink; ctx.lineWidth = 1.4; ctx.beginPath(); W.x.forEach((v, k) => ctx.lineTo(X(k), Y(v))); ctx.stroke();
      ctx.strokeStyle = P.ok; ctx.lineWidth = 2; ctx.beginPath(); f.est.forEach((v, k) => ctx.lineTo(X(k), Y(v))); ctx.stroke(); ctx.lineWidth = 1;
      ctx.textAlign = 'left'; ctx.fillStyle = P.ink; ctx.fillText('真值', l + 6, t + 10); ctx.fillStyle = P.mute; ctx.fillText('· 测量', l + 40, t + 10); ctx.fillStyle = P.ok; ctx.fillText('估计 ±2σ', l + 88, t + 10);
    }
    // ---- 增益 ----
    {
      const { ctx, w, h } = canvas2d(gc, 130), l = 30, r = 8, t = 18, b = h - 22;
      const X = k => l + k / (N - 1) * (w - l - r), Y = v => b - v * (b - t);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h); ctx.font = P.font;
      ctx.strokeStyle = P.grid; ctx.fillStyle = P.mute; ctx.textAlign = 'right';
      [0, .5, 1].forEach(v => { ctx.beginPath(); ctx.moveTo(l, Y(v)); ctx.lineTo(w - r, Y(v)); ctx.stroke(); ctx.fillText(v, l - 5, Y(v) + 4); });
      ctx.textAlign = 'center'; for (let k = 0; k < N; k += 20) ctx.fillText(k, X(k), h - 6);
      ctx.strokeStyle = P.mute; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(l, Y(Ki)); ctx.lineTo(w - r, Y(Ki)); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = P.ref; ctx.lineWidth = 1.6; ctx.setLineDash([5, 3]); ctx.beginPath(); L.forEach((v, k) => ctx.lineTo(X(k), Y(v))); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = P.ok; ctx.lineWidth = 2; ctx.beginPath(); f.K.forEach((v, k) => ctx.lineTo(X(k), Y(v))); ctx.stroke(); ctx.lineWidth = 1;
      ctx.textAlign = 'left'; ctx.fillStyle = P.ok; ctx.fillText('卡尔曼 K：从第 0 步往后', l + 4, 12);
      ctx.textAlign = 'right'; ctx.fillStyle = P.ref; ctx.fillText('LQR 的 L：从第 N 步往前', w - r - 2, 12);
    }
    const rms = a => Math.sqrt(a.reduce((s, v, k) => s + (v - W.x[k]) ** 2, 0) / N);
    const eF = rms(f.est), eZ = rms(W.z), best = Math.abs(Math.log10(st.Q / QT)) < .05 && Math.abs(Math.log10(st.R / RT)) < .05;
    out.innerHTML = `K 从 ${fmt(f.K[0], 2)} 收敛到 <b class="ok">K∞ = ${fmt(Ki, 3)}</b>（只看 Q/R = ${fmtv(st.Q / st.R)}）。<br>估计的误差 RMS <b class="ok">${fmt(eF, 3)}</b>，直接用测量是 ${fmt(eZ, 3)}。` +
      (best ? '现在 Q、R 正好等于真实噪声：平均来说这是误差最小的一组，换几组噪声看看。' : st.Q / st.R < QT / RT / 5 ? '太信模型：估计很平滑，但跟不上真值。' : st.Q / st.R > QT / RT * 5 ? '太信测量：估计跟着噪声乱跳。' : '');
  }

  qIn.addEventListener('input', () => { st.Q = 10 ** +qIn.value; draw(); });
  rIn.addEventListener('input', () => { st.R = 10 ** +rIn.value; draw(); });
  fig.querySelector('[data-act=reseed]').addEventListener('click', () => { st.seed++; W = world(st.seed); draw(); });
  fig.api = { set(o = {}) { if (o.seed != null && o.seed !== st.seed) W = world(o.seed); Object.assign(st, o); draw(); flash(fig); } };
  onResize(cv, draw);
}
const fmtv = v => v >= 1 ? fmt(v, 2) : v >= 0.01 ? fmt(v, 3) : v.toExponential(1);
