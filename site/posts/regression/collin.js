// 图：多重共线性。两个自变量的相关系数 ρ 用滑块拖；左边是一组样本的 (x₁, x₂)，右边是重抽 300 组得到的 (b₁, b₂)。
// 每组样本用的随机数固定，拖 ρ 时点云是连续变形的。api.set({ rho }) 给正文的“试试”。
import { palette, canvas2d, onResize, flash, fmt } from '/assets/fig.js';
import { rng, gauss } from './stats.js';

const M = 300, n = 50, LO = -2.5, HI = 4.5;
const RAW = Array.from({ length: M }, (_, m) => { const r = rng(500 + m); return Array.from({ length: n }, () => [gauss(r), gauss(r), gauss(r)]); });

// y = x₁ + x₂ + ε，回归 y ~ 1 + x₁ + x₂
export function estimates(rho) {
  const c = Math.sqrt(1 - rho * rho);
  return RAW.map(rows => {
    let m1 = 0, m2 = 0, my = 0; const d = rows.map(([u, z, e]) => { const x1 = u, x2 = rho * u + c * z, y = x1 + x2 + e; m1 += x1; m2 += x2; my += y; return [x1, x2, y]; });
    m1 /= n; m2 /= n; my /= n;
    let s11 = 0, s22 = 0, s12 = 0, s1y = 0, s2y = 0;
    for (const [x1, x2, y] of d) { const a = x1 - m1, b = x2 - m2, v = y - my; s11 += a * a; s22 += b * b; s12 += a * b; s1y += a * v; s2y += b * v; }
    const det = s11 * s22 - s12 * s12; return { b1: (s22 * s1y - s12 * s2y) / det, b2: (s11 * s2y - s12 * s1y) / det, d };
  });
}

export default function mount(fig) {
  const lc = fig.querySelector('canvas.xs'), rc = fig.querySelector('canvas.bs'), rIn = fig.querySelector('input[name=rho]'), out = fig.querySelector('.readout');
  const st = { rho: 0.5 };
  const sd = a => { const m = a.reduce((s, v) => s + v, 0) / a.length; return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length); };
  const base = sd(estimates(0).map(e => e.b1));

  function draw() {
    const P = palette(fig), E = estimates(st.rho);
    rIn.value = st.rho; fig.querySelector('output[for=rho]').textContent = fmt(st.rho, 3);
    const square = (cv, lo, hi, label) => {
      const size = Math.min(cv.clientWidth, 280), { ctx, w, h } = canvas2d(cv, size), pad = 22;
      const X = v => pad + (v - lo) / (hi - lo) * (w - pad - 6), Y = v => h - pad - (v - lo) / (hi - lo) * (h - pad - 6);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h); ctx.font = P.font;
      ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(X(lo), Y(0)); ctx.lineTo(X(hi), Y(0)); ctx.moveTo(X(0), Y(lo)); ctx.lineTo(X(0), Y(hi)); ctx.stroke();
      ctx.fillStyle = P.mute; ctx.textAlign = 'center'; ctx.fillText(label[0], w / 2, h - 5);
      ctx.save(); ctx.translate(10, h / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(label[1], 0, 0); ctx.restore();
      return { ctx, X, Y };
    };
    {
      const { ctx, X, Y } = square(lc, -3.2, 3.2, ['x₁', 'x₂']);
      ctx.fillStyle = P.ink; E[0].d.forEach(([a, b]) => { ctx.beginPath(); ctx.arc(X(a), Y(b), 2.4, 0, 7); ctx.fill(); });
      ctx.fillStyle = P.mute; ctx.textAlign = 'left'; ctx.fillText('一组样本的两个自变量', 26, 14);
    }
    {
      const { ctx, X, Y } = square(rc, LO, HI, ['b₁', 'b₂']);
      ctx.strokeStyle = P.mute; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(-2), Y(4)); ctx.lineTo(X(4), Y(-2)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = P.ok; ctx.globalAlpha = .45; E.forEach(e => { ctx.beginPath(); ctx.arc(X(Math.max(LO, Math.min(HI, e.b1))), Y(Math.max(LO, Math.min(HI, e.b2))), 2.2, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
      ctx.strokeStyle = P.ref; ctx.lineWidth = 2; const x = X(1), y = Y(1); ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6); ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = P.mute; ctx.textAlign = 'left'; ctx.fillText('300 组的系数估计；+ 是真值，虚线 b₁ + b₂ = 2', 26, 14);
    }
    const s1 = sd(E.map(e => e.b1)), sSum = sd(E.map(e => e.b1 + e.b2)), neg = E.filter(e => e.b1 < 0).length / M, vif = 1 / (1 - st.rho ** 2);
    out.innerHTML = `ρ = ${fmt(st.rho, 3)}：VIF = 1/(1−ρ²) = <b>${fmt(vif, 1)}</b>。<br>估计出的 b₁ 波动 sd = <b class="${vif > 10 ? 'bad' : 'ok'}">${fmt(s1, 3)}</b>（ρ = 0 时 ${fmt(base, 3)}，放大 ${fmt(s1 / base, 1)} 倍，约等于 √VIF = ${fmt(Math.sqrt(vif), 1)}）；` +
      `${Math.round(neg * 100)}% 的样本里 b₁ 连符号都是错的。<br>但 b₁ + b₂ 的波动只有 <b class="ok">${fmt(sSum, 3)}</b>：两个系数加起来照样准，拿模型做预测不受影响。`;
  }
  rIn.addEventListener('input', () => { st.rho = +rIn.value; draw(); });
  fig.api = { set(o = {}) { Object.assign(st, o); draw(); flash(fig); } };
  onResize(lc, draw);
}
