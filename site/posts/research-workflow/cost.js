// 图 2：画图和计算放一起 vs 分开。改 n 次图：
//   放一起：每次都要重跑计算 → n·(C + p)
//   分开：计算跑一次、导出 csv，之后只跑画图脚本 → C + n·p
// 拖红线（或滑块）改“改图次数”。
import { palette, canvas2d, drag, onResize, clamp, flash, plot } from '/assets/fig.js';

const NMAX = 40;
const hm = m => m < 60 ? `${Math.round(m)} 分钟` : `${Math.floor(m / 60)} 小时${Math.round(m % 60) ? ` ${Math.round(m % 60)} 分` : ''}`;
// 纵轴：四格，每格取 1/2/2.5/5×10ⁿ
const step4 = v => { const r = v / 4, e = 10 ** Math.floor(Math.log10(r)), f = r / e; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e; };

export default function mount(fig) {
  const cv = fig.querySelector('canvas'), out = fig.querySelector('.readout');
  const ins = Object.fromEntries(['C', 'p', 'n'].map(k => [k, fig.querySelector(`input[name=${k}]`)]));
  const st = { C: 15, p: 3, n: 10 };
  let g = null;
  const together = n => n * (st.C + st.p), apart = n => st.C + n * st.p;

  function draw() {
    const P = palette(fig), { ctx, w, h } = canvas2d(cv, Math.round(clamp(cv.clientWidth * .55, 220, 330)));
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    const box = { x: 44, y: 14, w: w - 58, h: h - 44 };
    const sy = step4(together(NMAX)), ymax = sy * Math.ceil(together(NMAX) / sy), yt = Array.from({ length: Math.round(ymax / sy) + 1 }, (_, i) => i * sy);
    const xs = Array.from({ length: NMAX }, (_, i) => i + 1);
    const { X, Y } = plot(ctx, box, {
      P, xr: [0, NMAX], yr: [0, ymax], xticks: [0, 10, 20, 30, 40], yticks: yt, xlabel: '改图次数', ylabel: '总耗时（分钟）',
      series: [
        { pts: xs.map(n => [n, together(n)]), color: P.ink, width: 2 },
        { pts: xs.map(n => [n, apart(n)]), color: P.ok, width: 2.4 },
      ],
    });
    g = { X, box };
    // 省下的那一段
    const x = X(st.n), yA = Y(together(st.n)), yB = Y(apart(st.n));
    ctx.fillStyle = P.ok; ctx.globalAlpha = .12; ctx.fillRect(x - 5, yA, 10, yB - yA); ctx.globalAlpha = 1;
    ctx.strokeStyle = P.hand; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, box.y); ctx.lineTo(x, box.y + box.h); ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = P.hand; ctx.beginPath(); ctx.arc(x, box.y + box.h, 6, 0, 7); ctx.fill();
    [[yA, P.ink], [yB, P.ok]].forEach(([y, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); });
    // 线尾标签
    // 线旁的名字：黑线标在左上方，绿线标在右下方，都不压线
    const nl = 30;
    ctx.font = P.font;
    ctx.textAlign = 'right'; ctx.fillStyle = P.ink; ctx.fillText('放一起', X(nl) - 6, Y(together(nl)) - 6);
    ctx.textAlign = 'left'; ctx.fillStyle = P.ok; ctx.fillText('分开', X(nl) + 6, Y(apart(nl)) + 16);

    for (const k in ins) { ins[k].value = st[k]; fig.querySelector(`output[for=${k}]`).textContent = k === 'n' ? `${st.n} 次` : `${st[k]} 分`; }
    const T = together(st.n), A = apart(st.n);
    out.innerHTML = `改 <b>${st.n}</b> 次图：<br>放一起 = ${st.n} × (${st.C} + ${st.p}) = <b>${hm(T)}</b><br>分开 = ${st.C} + ${st.n} × ${st.p} = <b class="ok">${hm(A)}</b><br>` +
      (st.n > 1 ? `省下 (n − 1) × C = <b class="ok">${hm(T - A)}</b>，计算越慢、改得越多，省得越多。` : '只画一次的话两种一样快；从第二次改图开始，分开就赢了。');
  }

  drag(cv, {
    hit: (x, y) => g && x > g.box.x - 10 && x < g.box.x + g.box.w + 10 && y > g.box.y - 6 && y < g.box.y + g.box.h + 12 ? 1 : null,
    move: (_, x) => { st.n = clamp(Math.round((x - g.box.x) / g.box.w * NMAX), 1, NMAX); draw(); },
  });
  for (const k in ins) ins[k].addEventListener('input', () => { st[k] = +ins[k].value; draw(); });
  fig.api = { set(o = {}) { for (const k of ['C', 'p', 'n']) if (o[k] != null) st[k] = o[k]; draw(); flash(fig); } };
  onResize(cv, draw);
}
