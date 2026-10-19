// 图：线性映射把单位方格变成平行四边形。拖两个红色箭头（矩阵的两列），面积就是 |det|，det < 0 时旗子被翻成镜像。
// api.set({ a, b, c, d }) 给正文的“试试”：矩阵 [a b; c d]，两列是 (a, c) 和 (b, d)。
import { palette, canvas2d, drag, onResize, clamp, flash, fmt } from '/assets/fig.js';

const R = 2.5;

export default function mount(fig) {
  const cv = fig.querySelector('canvas.lin'), out = fig.querySelector('.readout');
  const st = { a: 2, b: 0.5, c: 0.5, d: 1.5 };
  let g;

  function draw() {
    const P = palette(fig), size = Math.max(260, Math.min(cv.clientWidth * 0.8, 380)), { ctx, w, h } = canvas2d(cv, size);
    const k = Math.min(w, h) / (2 * R), cx = w / 2 - 1.0 * k, cy = h / 2 + 1.0 * k;   // 原点放在偏左下，第一象限多留点地方
    const T = (x, y) => [cx + (st.a * x + st.b * y) * k, cy - (st.c * x + st.d * y) * k], S = (x, y) => [cx + x * k, cy - y * k];
    g = { cx, cy, k };
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h); ctx.font = P.font;
    // 原来的网格
    ctx.strokeStyle = P.grid; ctx.lineWidth = 1;
    for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(...S(i, -6)); ctx.lineTo(...S(i, 6)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(...S(-6, i)); ctx.lineTo(...S(6, i)); ctx.stroke(); }
    // 被映射后的网格：整张纸怎么被拉
    ctx.strokeStyle = P.ok; ctx.globalAlpha = .22;
    for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(...T(i, -6)); ctx.lineTo(...T(i, 6)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(...T(-6, i)); ctx.lineTo(...T(6, i)); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = P.mute; ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    // 单位方格（虚线）和它的像
    ctx.setLineDash([4, 3]); ctx.strokeStyle = P.mute; ctx.beginPath(); [[0, 0], [1, 0], [1, 1], [0, 1]].forEach((p, i) => i ? ctx.lineTo(...S(...p)) : ctx.moveTo(...S(...p))); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
    const poly = [[0, 0], [1, 0], [1, 1], [0, 1]].map(p => T(...p));
    ctx.beginPath(); poly.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath();
    ctx.fillStyle = P.ok; ctx.globalAlpha = .22; ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = P.ok; ctx.lineWidth = 1.5; ctx.stroke(); ctx.lineWidth = 1;
    // 旗子：看得出有没有被翻面
    const flag = [[0.2, 0.18], [0.2, 0.82], [0.62, 0.62]];
    ctx.beginPath(); flag.map(p => S(...p)).forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); ctx.strokeStyle = P.mute; ctx.stroke();
    ctx.beginPath(); flag.map(p => T(...p)).forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); ctx.fillStyle = P.ink; ctx.globalAlpha = .55; ctx.fill(); ctx.globalAlpha = 1;
    // 两列：红箭头，能拖
    const arrow = (x, y, label) => {
      const [x0, y0] = S(0, 0), [x1, y1] = S(x, y), an = Math.atan2(y1 - y0, x1 - x0);
      ctx.strokeStyle = P.hand; ctx.fillStyle = P.hand; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 10 * Math.cos(an - .35), y1 - 10 * Math.sin(an - .35)); ctx.lineTo(x1 - 10 * Math.cos(an + .35), y1 - 10 * Math.sin(an + .35)); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = .16; ctx.beginPath(); ctx.arc(x1, y1, 13, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      ctx.font = '600 13px -apple-system, sans-serif'; ctx.fillText(label, x1 + 9, y1 - 9); ctx.font = P.font;
    };
    arrow(st.a, st.c, '第 1 列'); arrow(st.b, st.d, '第 2 列');
    const det = st.a * st.d - st.b * st.c;
    out.innerHTML = `矩阵 [${fmt(st.a)} ${fmt(st.b)}; ${fmt(st.c)} ${fmt(st.d)}]：det = ${fmt(st.a)}×${fmt(st.d)} − ${fmt(st.b)}×${fmt(st.c)} = <b class="ok">${fmt(det, 3)}</b>。<br>` +
      (Math.abs(det) < 1e-9 ? '两列共线，方格被压成一条线，面积是 0：这个映射没有逆。' : `单位方格的面积 1 变成了 <b class="ok">${fmt(Math.abs(det), 3)}</b>。` + (det < 0 ? '行列式是负的：旗子被翻成了镜像，方向反了，面积按绝对值算。' : '行列式是正的：旗子只是被拉歪，方向没变。'));
  }
  const snap = v => Math.round(v * 20) / 20;
  drag(cv, {
    hit(x, y) { const d1 = Math.hypot(x - (g.cx + st.a * g.k), y - (g.cy - st.c * g.k)), d2 = Math.hypot(x - (g.cx + st.b * g.k), y - (g.cy - st.d * g.k)); return Math.min(d1, d2) > 22 ? null : d1 <= d2 ? 1 : 2; },
    move(i, x, y) { const u = clamp(snap((x - g.cx) / g.k), -1.4, 3.4), v = clamp(snap((g.cy - y) / g.k), -1.4, 3.4); if (i === 1) { st.a = u; st.c = v; } else { st.b = u; st.d = v; } draw(); },
  });
  fig.api = { set(o = {}) { Object.assign(st, o); draw(); flash(fig); } };
  onResize(cv, draw);
}
