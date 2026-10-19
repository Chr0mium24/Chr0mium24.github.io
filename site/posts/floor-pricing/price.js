// 图：(p, F) 平面，两条轴都是对数刻度。实线 pF = ΔC 是分界：左下方期望罚追不上省下的钱，违规划算。
// 拖红点改 p 和 F；滑块改 ΔC；两个开关：财富上限 W（罚超过 W 的部分收不上来），隐匿（花 k 把 p 压成 p·e^(−λk)）。
// api.set({ p, F, dc, cap, W, hide, inv }) 给正文的“试试”；inv = 1/λ，单位元。
import { palette, canvas2d, drag, onResize, clamp, flash } from '/assets/fig.js';

const P0 = -3, P1 = 0, F0 = 2, F1 = 7;   // log10 范围：p ∈ [0.1%, 100%]，F ∈ [100 元, 1000 万元]
const lg = Math.log10;

export function money(v) {
  if (v >= 1e8) return +(v / 1e8).toPrecision(3) + ' 亿';
  if (v >= 1e4) return +(v / 1e4).toPrecision(3) + ' 万';
  return Math.round(v).toLocaleString('en-US');
}
export const pct = p => (p >= 0.1 ? +(p * 100).toPrecision(3) : p >= 0.01 ? +(p * 100).toPrecision(2) : +(p * 100).toPrecision(2)) + '%';

// 经营者的最优选择：返回期望罚、隐匿花费、压低后的 p、净收益
export function decide({ p, F, dc, cap, W, hide, inv }) {
  const Fe = cap ? Math.min(F, W) : F, lam = 1 / inv;
  if (hide && p * lam * Fe > 1) { const k = Math.log(lam * p * Fe) / lam, ps = 1 / (lam * Fe); return { Fe, k, ps, pen: ps * Fe, G: dc - ps * Fe - k }; }
  return { Fe, k: 0, ps: p, pen: p * Fe, G: dc - p * Fe };
}
// 要让违规不划算，p·F 至少要多大（隐匿时这条线会被抬得很高）
export const bar = ({ dc, hide, inv }) => !hide || dc <= inv ? dc : Math.exp(dc / inv - 1) * inv;

export default function mount(fig) {
  const cv = fig.querySelector('canvas.pf'), out = fig.querySelector('.readout');
  const ins = Object.fromEntries([...fig.querySelectorAll('input[type=range]')].map(i => [i.name, i]));
  const tgs = [...fig.querySelectorAll('[data-flag]')];
  const st = { p: 0.01, F: 5e4, dc: 1000, cap: false, W: 1e5, hide: false, inv: 100 };
  let g;

  function draw() {
    const P = palette(fig), size = Math.min(cv.clientWidth * 0.82, 400), { ctx, w, h } = canvas2d(cv, Math.max(280, size));
    const l = 52, r = 10, t = 10, b = h - 30;
    const X = p => l + (lg(p) - P0) / (P1 - P0) * (w - l - r), Y = F => b - (lg(F) - F0) / (F1 - F0) * (b - t);
    const Xi = px => 10 ** (P0 + (px - l) / (w - l - r) * (P1 - P0)), Yi = py => 10 ** (F0 + (b - py) / (b - t) * (F1 - F0));
    g = { X, Y, Xi, Yi };
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h); ctx.font = P.font;
    const B = bar(st), W = st.cap ? st.W : Infinity;
    // 不划算的区域：p·min(F, W) ≥ B，浅绿
    ctx.save(); ctx.beginPath(); ctx.rect(l, t, w - l - r, b - t); ctx.clip();
    ctx.beginPath(); ctx.moveTo(X(10 ** P1), Y(10 ** F1));
    for (let i = 400; i >= 0; i--) { const p = 10 ** (P0 + i / 400 * (P1 - P0)), Fb = B / p; ctx.lineTo(X(p), Fb <= W ? Y(clamp(Fb, 10 ** (F0 - 1), 10 ** (F1 + 1))) : Y(10 ** (F1 + 1))); }
    ctx.lineTo(X(10 ** P0), Y(10 ** (F1 + 1))); ctx.closePath();
    ctx.fillStyle = P.ok; ctx.globalAlpha = .12; ctx.fill(); ctx.globalAlpha = 1;
    // 网格
    ctx.strokeStyle = P.grid; ctx.lineWidth = 1;
    for (let e = P0; e <= P1; e++) { ctx.beginPath(); ctx.moveTo(X(10 ** e), t); ctx.lineTo(X(10 ** e), b); ctx.stroke(); }
    for (let e = F0; e <= F1; e++) { ctx.beginPath(); ctx.moveTo(l, Y(10 ** e)); ctx.lineTo(w - r, Y(10 ** e)); ctx.stroke(); }
    const iso = (v, style) => { ctx.beginPath(); ctx.moveTo(X(10 ** P0), Y(v / 10 ** P0)); ctx.lineTo(X(1), Y(v)); style(); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1; };
    // 隐匿后被压到的那条线 pF = 1/λ，和抬高了的分界 pF = B
    if (st.hide) {
      iso(st.inv, () => { ctx.strokeStyle = P.ref; ctx.setLineDash([2, 3]); ctx.lineWidth = 1.3; });
      if (B > st.dc) iso(B, () => { ctx.strokeStyle = P.ink; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.5; });
    }
    iso(st.dc, () => { ctx.strokeStyle = P.ink; ctx.lineWidth = 2; });
    if (st.cap) { ctx.strokeStyle = P.ref; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(l, Y(st.W)); ctx.lineTo(w - r, Y(st.W)); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1; }
    ctx.restore();
    // 轴
    ctx.fillStyle = P.mute; ctx.textAlign = 'center';
    for (let e = P0; e <= P1; e++) { ctx.textAlign = e === P1 ? 'right' : 'center'; ctx.fillText(pct(10 ** e), X(10 ** e) + (e === P1 ? 2 : 0), b + 15); }
    ctx.textAlign = 'center';
    ctx.fillText('被查出的概率 p', (l + w - r) / 2, h - 2);
    ctx.textAlign = 'right'; for (let e = F0; e <= F1; e++) ctx.fillText(money(10 ** e), l - 6, Y(10 ** e) + 4);
    ctx.save(); ctx.translate(11, (t + b) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('查实后的罚 F（元）', 0, 0); ctx.restore();
    // 区域和线的标签
    ctx.textAlign = 'left'; ctx.fillStyle = P.mute; ctx.fillText('违规划算', l + 8, b - 8);
    ctx.textAlign = 'right'; ctx.fillStyle = P.ok; ctx.fillText('违规不划算', w - r - 6, t + 14);
    const pl = clamp(st.dc / 10 ** (F1 - 0.4), 10 ** (P0 + 0.15), 10 ** (P1 - 0.7));
    ctx.textAlign = 'left'; ctx.fillStyle = P.ink; ctx.fillText('pF = ΔC', X(pl) + 8, clamp(Y(st.dc / pl) - 2, t + 12, b - 20));
    if (st.cap) { ctx.fillStyle = P.ref; ctx.textAlign = 'right'; ctx.fillText(`财富上限 W = ${money(st.W)}`, w - r - 6, Y(st.W) - 5); }
    // 红点，以及它“实际”落在哪
    const d = decide(st), x0 = X(st.p), y0 = Y(st.F), ye = Y(d.Fe), xs = X(Math.max(d.ps, 10 ** P0));
    ctx.strokeStyle = P.mute; ctx.lineWidth = 1.3;
    const arrow = (x1, y1, x2, y2) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); const a = Math.atan2(y2 - y1, x2 - x1); ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 7 * Math.cos(a - .4), y2 - 7 * Math.sin(a - .4)); ctx.lineTo(x2 - 7 * Math.cos(a + .4), y2 - 7 * Math.sin(a + .4)); ctx.closePath(); ctx.fillStyle = P.mute; ctx.fill(); };
    if (ye - y0 > 12) arrow(x0, y0 + 8, x0, ye - 6);
    if (x0 - xs > 12) arrow(x0 - 8, ye, xs + 6, ye);
    if (ye - y0 > 12 || x0 - xs > 12) { ctx.strokeStyle = P.ink; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.arc(xs, ye, 5.5, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
    ctx.lineWidth = 1;
    ctx.fillStyle = P.hand; ctx.globalAlpha = .18; ctx.beginPath(); ctx.arc(x0, y0, 13, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(x0, y0, 6, 0, 7); ctx.fill();
    say(d);
  }

  function say(d) {
    let s = `省下 ΔC = <b>${money(st.dc)} 元</b>；查出概率 ${pct(st.p)}，罚 ${money(st.F)} 元。`;
    if (st.cap && st.F > st.W) s += `但他最多只拿得出 W = ${money(st.W)} 元，超出的部分收不上来。`;
    if (d.k > 0) s += `<br>花 ${money(d.k)} 元做隐匿，把被查概率从 ${pct(st.p)} 压到 ${pct(d.ps)}，期望罚只剩 1/λ = ${money(d.pen)} 元。`;
    else s += `<br>期望罚 p × F = ${money(d.pen)} 元。`;
    s += d.G > 0 ? `<br>净赚 <b class="bad">${money(d.G)} 元：违规划算</b>。` : `<br>净亏 <b class="ok">${money(-d.G)} 元：违规不划算</b>。`;
    if (st.hide && bar(st) > st.dc) s += `允许隐匿时，要让违规不划算，p × F 得高过 ${money(bar(st))} 元（虚线），而不是 ΔC。`;
    out.innerHTML = s;
    for (const k in ins) { ins[k].value = lg(st[k]); fig.querySelector(`output[for=${k}]`).textContent = money(st[k]); }
    fig.querySelector('.ctl.W').hidden = !st.cap; fig.querySelector('.ctl.inv').hidden = !st.hide;
    tgs.forEach(b => b.setAttribute('aria-pressed', !!st[b.dataset.flag]));
  }

  drag(cv, {
    hit: (x, y) => Math.hypot(x - g.X(st.p), y - g.Y(st.F)) < 22 ? 1 : x > g.X(10 ** P0) && y < g.Y(10 ** F0) ? 1 : null,
    move: (_, x, y) => { st.p = clamp(g.Xi(x), 10 ** P0, 1); st.F = clamp(g.Yi(y), 10 ** F0, 10 ** F1); draw(); },
  });
  for (const k in ins) ins[k].addEventListener('input', () => { st[k] = 10 ** +ins[k].value; draw(); });
  tgs.forEach(b => b.addEventListener('click', () => { st[b.dataset.flag] = !st[b.dataset.flag]; draw(); }));
  fig.api = { set(o = {}) { Object.assign(st, o); draw(); flash(fig); } };
  onResize(cv, draw);
}
