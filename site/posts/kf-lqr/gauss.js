// 图：两个高斯相乘。红实线是先验 N(x̂⁻, P⁻)，红虚线是测量 N(z, R)，绿色是归一化后的乘积（后验）。
// 拖峰顶：左右挪均值，上下改高矮（越高越窄）。api.set({ m1, s1, m2, s2 }) 给正文的“试试”。
import { palette, canvas2d, drag, onResize, clamp, flash, fmt } from '/assets/fig.js';

const X0 = -6, X1 = 6, YMAX = 1.1, SMIN = 0.4, SMAX = 3, RT = Math.sqrt(2 * Math.PI);
export const fuse = (m1, s1, m2, s2) => { const K = s1 * s1 / (s1 * s1 + s2 * s2), v = 1 / (1 / (s1 * s1) + 1 / (s2 * s2)); return { K, m: m1 + K * (m2 - m1), s: Math.sqrt(v) }; };
const pdf = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * RT);

export default function mount(fig) {
  const cv = fig.querySelector('canvas.gauss'), out = fig.querySelector('.readout');
  const sIn = { s1: fig.querySelector('input[name=s1]'), s2: fig.querySelector('input[name=s2]') };
  const st = { m1: -1.5, s1: 1.4, m2: 1.5, s2: 0.8 };
  let g, grab;

  function draw() {
    const P = palette(fig), { ctx, w, h } = canvas2d(cv, 250), pad = 10, base = h - 26;
    const X = x => pad + (x - X0) / (X1 - X0) * (w - 2 * pad), Y = y => base - y / YMAX * (base - 12), Xi = px => X0 + (px - pad) / (w - 2 * pad) * (X1 - X0);
    g = { X, Y, Xi, sy: (base - 12) / YMAX };
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h); ctx.font = P.font;
    ctx.strokeStyle = P.mute; ctx.beginPath(); ctx.moveTo(pad, base); ctx.lineTo(w - pad, base); ctx.stroke();
    ctx.fillStyle = P.mute; ctx.textAlign = 'center';
    for (let x = -6; x <= 6; x += 2) { ctx.fillRect(X(x), base, 1, 4); ctx.fillText(x, X(x), base + 16); }
    const f = fuse(st.m1, st.s1, st.m2, st.s2);
    const curve = (m, s, k = 1) => { ctx.beginPath(); for (let px = pad; px <= w - pad; px += 1.5) { const y = Y(k * pdf(Xi(px), m, s)); px === pad ? ctx.moveTo(px, y) : ctx.lineTo(px, y); } };
    // 后验：填色
    curve(f.m, f.s); ctx.lineTo(w - pad, base); ctx.lineTo(pad, base); ctx.closePath();
    ctx.fillStyle = P.ok; ctx.globalAlpha = .2; ctx.fill(); ctx.globalAlpha = 1;
    curve(f.m, f.s); ctx.strokeStyle = P.ok; ctx.lineWidth = 2; ctx.stroke();
    // 先验、测量
    ctx.strokeStyle = P.hand; ctx.lineWidth = 1.8; curve(st.m1, st.s1); ctx.stroke();
    ctx.setLineDash([6, 4]); curve(st.m2, st.s2); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
    // 峰顶的把手
    [[st.m1, st.s1, '先验'], [st.m2, st.s2, '测量']].forEach(([m, s, t]) => {
      const x = X(m), y = Y(pdf(m, m, s));
      ctx.fillStyle = P.hand; ctx.globalAlpha = .16; ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill();
      ctx.fillText(t, x, Math.max(12, y - 16));
    });
    const fx = X(f.m), fy = Y(pdf(f.m, f.m, f.s));
    ctx.strokeStyle = P.ok; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, base); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = P.ok; ctx.fillText('后验', fx, Math.max(12, fy - 10));
    out.innerHTML = `增益 <b class="ok">K = P⁻/(P⁻+R) = ${fmt(f.K, 3)}</b>：后验均值从先验的 ${fmt(st.m1)} 往测量的 ${fmt(st.m2)} 走了 ${Math.round(f.K * 100)}%，落在 ${fmt(f.m)}。<br>` +
      `方差：1/P = 1/${fmt(st.s1 ** 2)} + 1/${fmt(st.s2 ** 2)}，P = <b class="ok">${fmt(f.s ** 2, 3)}</b>，比两个都小。` + (Math.abs(f.K - .5) < .02 ? '两边一样准，就取正中间。' : f.K > .5 ? '测量更准，听测量的多。' : '先验更准，听先验的多。');
    sIn.s1.value = st.s1; sIn.s2.value = st.s2;
    fig.querySelector('output[for=s1]').textContent = fmt(st.s1); fig.querySelector('output[for=s2]').textContent = fmt(st.s2);
  }

  const peak = k => [g.X(st['m' + k]), g.Y(pdf(0, 0, st['s' + k]))];
  drag(cv, {
    hit(x, y) {
      for (const k of [2, 1]) { const [px, py] = peak(k); if (Math.hypot(x - px, y - py) < 20) return k; }
      // 不在峰顶：挑竖直方向离指针最近的那条曲线
      const d = [1, 2].map(k => Math.abs(g.Y(pdf(g.Xi(x), st['m' + k], st['s' + k])) - y));
      const k = d[0] < d[1] ? 1 : 2; return d[k - 1] < 22 ? k : null;
    },
    start(k, x, y) { grab = { dx: x - g.X(st['m' + k]), y, h: pdf(0, 0, st['s' + k]) }; },
    move(k, x, y) {
      st['m' + k] = clamp(g.Xi(x - grab.dx), X0 + .5, X1 - .5);
      const hgt = clamp(grab.h + (grab.y - y) / g.sy, 1 / (SMAX * RT), 1 / (SMIN * RT));
      st['s' + k] = +clamp(1 / (hgt * RT), SMIN, SMAX).toFixed(3); draw();
    },
  });
  for (const k of ['s1', 's2']) sIn[k].addEventListener('input', () => { st[k] = +sIn[k].value; draw(); });
  fig.api = { set(o = {}) { Object.assign(st, o); draw(); flash(fig); } };
  onResize(cv, draw);
}
