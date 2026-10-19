// 图：可拖的散点 + OLS 直线 + 残差图 + Q-Q 图，开关五种“毛病”，右边是五项诊断和重抽 400 组的结果。
// 点都能拖（红的）；api.set({ f: { nonlin, auto, hetero, heavy, outlier }, seed }) 给正文的“试试”。
import { palette, canvas2d, drag, onResize, clamp, flash, fmt } from '/assets/fig.js';
import { generate, fit, monteCarlo, truth, qnorm, N } from './stats.js';

const SEED = 130;

export default function mount(fig) {
  const sc = fig.querySelector('canvas.scatter'), rc = fig.querySelector('canvas.resid'), qc = fig.querySelector('canvas.qq');
  const out = fig.querySelector('.readout'), mcOut = fig.querySelector('.mc'), tg = [...fig.querySelectorAll('[data-flag]')];
  const st = { f: {}, seed: SEED };
  let pts, yr, R, MC, g, dragged = false, hot = -1;

  function regen() {
    pts = generate(st.f, st.seed);
    const ys = pts.map(p => p.y); yr = [Math.min(0, ...ys) - 1, Math.max(...ys) + 1.2];
    MC = monteCarlo(st.f); dragged = false;
  }

  function draw() {
    R = fit(pts);
    const P = palette(fig);
    tg.forEach(b => b.setAttribute('aria-pressed', !!st.f[b.dataset.flag]));
    // ---- 散点 ----
    {
      const { ctx, w, h } = canvas2d(sc, 280), l = 30, r = 8, t = 8, b = h - 22;
      const X = x => l + x / 10 * (w - l - r), Y = y => b - (y - yr[0]) / (yr[1] - yr[0]) * (b - t);
      g = { X, Y, Xi: px => (px - l) / (w - l - r) * 10, Yi: py => yr[0] + (b - py) / (b - t) * (yr[1] - yr[0]) };
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h); ctx.font = P.font;
      ctx.strokeStyle = P.grid; ctx.fillStyle = P.mute; ctx.textAlign = 'right';
      const step = yr[1] - yr[0] > 16 ? 4 : 2;
      for (let v = Math.ceil(yr[0] / step) * step; v <= yr[1]; v += step) { ctx.beginPath(); ctx.moveTo(l, Y(v)); ctx.lineTo(w - r, Y(v)); ctx.stroke(); ctx.fillText(v, l - 5, Y(v) + 4); }
      ctx.textAlign = 'center'; for (let x = 0; x <= 10; x += 2) ctx.fillText(x, X(x), h - 6);
      // 真值（蓝虚线）和 OLS（绿）
      ctx.strokeStyle = P.ref; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath();
      for (let x = 0; x <= 10.001; x += 0.1) { const y = Y(truth(x, st.f)); x ? ctx.lineTo(X(x), y) : ctx.moveTo(X(x), y); }
      ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = P.ok; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(X(0), Y(R.a)); ctx.lineTo(X(10), Y(R.a + 10 * R.b)); ctx.stroke(); ctx.lineWidth = 1;
      pts.forEach((p, i) => {
        const x = X(p.x), y = Y(p.y);
        if (i === R.cookI && R.cook > 0.5) { ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.stroke(); }
        ctx.fillStyle = P.hand; ctx.globalAlpha = i === hot ? .5 : .22; ctx.beginPath(); ctx.arc(x, y, i === hot ? 6 : 4.2, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = P.hand; ctx.lineWidth = 1.2; ctx.stroke(); ctx.lineWidth = 1;
      });
      ctx.textAlign = 'left'; ctx.fillStyle = P.ok; ctx.fillText(`OLS：y = ${fmt(R.a)} + ${fmt(R.b, 3)}x`, l + 6, t + 12);
      ctx.fillStyle = P.ref; ctx.fillText('真实关系（虚线）', l + 6, t + 27);
    }
    // ---- 残差 vs x（x 的顺序就是时间顺序） ----
    {
      const { ctx, w, h } = canvas2d(rc, 150), l = 30, r = 6, t = 18, b = h - 20;
      const m = Math.max(...R.e.map(Math.abs)) * 1.1 || 1, X = x => l + x / 10 * (w - l - r), Y = v => (t + b) / 2 - v / m * (b - t) / 2;
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h); ctx.font = P.font;
      ctx.strokeStyle = P.mute; ctx.beginPath(); ctx.moveTo(l, Y(0)); ctx.lineTo(w - r, Y(0)); ctx.stroke();
      ctx.fillStyle = P.mute; ctx.textAlign = 'right'; ctx.fillText('0', l - 5, Y(0) + 4); ctx.fillText(fmt(m, 1), l - 5, t + 4); ctx.fillText('−' + fmt(m, 1), l - 5, b + 4);
      ctx.textAlign = 'center'; for (let x = 0; x <= 10; x += 2) ctx.fillText(x, X(x), h - 5);
      ctx.strokeStyle = P.grid; ctx.lineWidth = 1.2; ctx.beginPath(); pts.forEach((p, i) => ctx.lineTo(X(p.x), Y(R.e[i]))); ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = P.ink; pts.forEach((p, i) => { ctx.beginPath(); ctx.arc(X(p.x), Y(R.e[i]), 2.6, 0, 7); ctx.fill(); });
      // 滑动平均（7 个点）：看残差有没有系统性的弯
      ctx.strokeStyle = P.ok; ctx.lineWidth = 2; ctx.beginPath();
      pts.forEach((p, i) => { const a = Math.max(0, i - 3), z = Math.min(N - 1, i + 3); let s = 0; for (let k = a; k <= z; k++) s += R.e[k]; ctx.lineTo(X(p.x), Y(s / (z - a + 1))); });
      ctx.stroke(); ctx.lineWidth = 1;
      ctx.textAlign = 'left'; ctx.fillStyle = P.mute; ctx.fillText('残差 vs x（按顺序连起来；绿线是 7 点滑动平均）', l + 4, 12);
    }
    // ---- Q-Q ----
    {
      const size = Math.min(qc.clientWidth, 170), { ctx, w, h } = canvas2d(qc, 150), pad = 18, M = 3.3;
      const X = v => pad + (v + M) / (2 * M) * (w - pad - 6), Y = v => h - 18 - (v + M) / (2 * M) * (h - 36);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h); ctx.font = P.font;
      ctx.strokeStyle = P.ref; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(X(-M), Y(-M)); ctx.lineTo(X(M), Y(M)); ctx.stroke(); ctx.lineWidth = 1;
      const zs = R.e.map(v => v / R.s).sort((a, b) => a - b);
      ctx.fillStyle = P.ink; zs.forEach((z, i) => { const q = qnorm((i + 1 - .375) / (N + .25)); ctx.beginPath(); ctx.arc(X(q), Y(clamp(z, -M, M)), 2.4, 0, 7); ctx.fill(); });
      ctx.fillStyle = P.mute; ctx.textAlign = 'left'; ctx.fillText('Q-Q：残差 vs 正态', 4, 12); ctx.textAlign = 'center'; ctx.fillText('正态分位数', w / 2, h - 4);
    }
    say();
  }

  function say() {
    const row = (ok, name, txt) => `<div class="dx"><b class="${ok ? 'ok' : 'bad'}">${ok ? '✓' : '✗'}</b><span>${name}</span><span>${txt}</span></div>`;
    const p = v => v < 0.001 ? '< 0.001' : fmt(v, 3);
    out.innerHTML = `斜率 <b>${fmt(R.b, 3)}</b>，普通 SE ${fmt(R.se, 3)}，R² = ${fmt(R.r2, 2)}` +
      row(R.pCurv >= .05, '线性', `加二次项 t = ${fmt(R.curvT, 1)}（p ${p(R.pCurv)}）`) +
      row(R.dw >= 1.5 && R.dw <= 2.5, '独立', `DW = ${fmt(R.dw, 2)}（2 附近才正常）`) +
      row(R.pBP >= .05, '同方差', `Breusch–Pagan p ${p(R.pBP)}`) +
      row(R.pJB >= .05, '正态', `Jarque–Bera p ${p(R.pJB)}`) +
      row(R.cook <= .5, '离群', `最大 Cook 距离 ${fmt(R.cook, 2)}${R.cook > .5 ? '（圈出来的那个点）' : ''}`);
    const ratio = MC.sd / MC.se;
    let s = `按现在的开关重抽 400 组：斜率平均 ${fmt(MC.mean, 3)}（真值 0.5），真实波动 sd = <b>${fmt(MC.sd, 3)}</b>；普通 SE 平均给 ${fmt(MC.se, 3)}`;
    s += ratio > 1.15 ? `，<b class="bad">低估了 ${fmt(ratio, 1)} 倍</b>` : ratio < 0.85 ? '，偏大' : '，基本对得上';
    if (st.f.hetero) s += `；White 稳健 SE 给 ${fmt(MC.hc1, 3)}`;
    if (st.f.auto) s += `；Newey–West 给 ${fmt(MC.nw, 3)}`;
    s += '。' + (st.f.nonlin ? '（真实关系是弯的，“真值 0.5”只是直线部分的斜率。）' : '') + (dragged ? '（拖过点了：这一行还是按开关生成的数据算的。）' : '');
    mcOut.innerHTML = s;
  }

  tg.forEach(b => b.addEventListener('click', () => { st.f[b.dataset.flag] = !st.f[b.dataset.flag]; regen(); draw(); }));
  fig.querySelector('[data-act=reseed]').addEventListener('click', () => { st.seed++; regen(); draw(); });
  drag(sc, {
    hit(x, y) { let best = -1, d0 = 16; pts.forEach((p, i) => { const d = Math.hypot(g.X(p.x) - x, g.Y(p.y) - y); if (d < d0) { d0 = d; best = i; } }); return best < 0 ? null : best; },
    hover(i) { const v = i ?? -1; if (v !== hot) { hot = v; draw(); } },
    move(i, x, y) { hot = i; pts[i] = { x: clamp(g.Xi(x), 0, 10), y: clamp(g.Yi(y), yr[0], yr[1]) }; dragged = true; draw(); },
    end() { hot = -1; draw(); },
  });
  fig.api = { set(o = {}) { if (o.f) st.f = { ...o.f }; if (o.seed != null) st.seed = o.seed; regen(); draw(); flash(fig); } };
  regen();
  onResize(sc, draw);
}
