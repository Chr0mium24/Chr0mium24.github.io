// 图 1：主动学习 vs 随机采样。左右两块是同一份未标注数据池上的两个模型，
// 底色越深 = 模型越拿不准（熵越高），线是决策边界；实心点是已经标注的，带圈的是这一轮新挑的。
// 下面是两条“准确率 – 标注数”曲线，拖红线改标注预算。
import { palette, canvas2d, drag, onResize, clamp, flash, seg, plot } from '/assets/fig.js';
import { run, prob, entropy } from './al.js';

const G = 46; // 底色网格

const rgb = c => { const m = c.match(/^#?([0-9a-f]{6})$/i); if (m) { const n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255]; } const k = c.match(/\d+(\.\d+)?/g)?.map(Number) || [0, 0, 0]; return k.slice(0, 3); };
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
// 底色小图：p(i, j) 给概率；类别色 7%，再按熵叠灰
export function shade(P, n, p, k = .55) {
  const off = document.createElement('canvas'); off.width = off.height = n;
  const g = off.getContext('2d'), img = g.createImageData(n, n), bg = rgb(P.bg), c0 = rgb(P.ref), c1 = rgb(P.ink), m = rgb(P.mute);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const q = p(i, j), col = mix(mix(bg, q > .5 ? c1 : c0, .07), m, k * entropy(q) ** 2), o = (j * n + i) * 4;
    img.data[o] = col[0]; img.data[o + 1] = col[1]; img.data[o + 2] = col[2]; img.data[o + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return off;
}

export default function mount(fig) {
  const cR = fig.querySelector('canvas.rand'), cA = fig.querySelector('canvas.al'), cC = fig.querySelector('canvas.curve');
  const out = fig.querySelector('.readout'), nIn = fig.querySelector('input[name=n]');
  const st = { seed: 7, k: 5, i: 4 };
  let R = run(st), gC = null;
  const setK = seg(fig.querySelector('.seg.k'), v => { st.k = +v; rerun(); });

  function rerun(keepN = true) {
    const n = R[ 'al' ][st.i]?.n ?? 24;
    R = run({ seed: st.seed, k: st.k });
    st.i = keepN ? nearest(n) : 0;
    draw();
  }
  const nearest = n => { let b = 0; R.al.forEach((h, i) => { if (Math.abs(h.n - n) < Math.abs(R.al[b].n - n)) b = i; }); return b; };

  function panel(cv, h, prev, P) {
    const { ctx, w } = canvas2d(cv, cv.clientWidth);
    const X = x => (x + 1) / 2 * w, Y = y => (1 - (y + 1) / 2) * w;
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, w);
    // 底色：类别色淡淡铺一层，熵高的地方叠灰；先在 G×G 的小图上算好，再平滑放大
    const cell = w / G, grid = [];
    for (let j = 0; j <= G; j++) { grid.push([]); for (let i = 0; i <= G; i++) grid[j].push(prob(h.w, i / G * 2 - 1, 1 - j / G * 2)); }
    const off = shade(P, G, (i, j) => (grid[j][i] + grid[j][i + 1] + grid[j + 1][i] + grid[j + 1][i + 1]) / 4);
    ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, w, w);
    // 决策边界 p = 0.5：网格上找符号变化，连线段（marching squares）
    ctx.strokeStyle = P.ink; ctx.lineWidth = 1.6; ctx.beginPath();
    const at = (i, j) => grid[j][i] - .5;
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
      const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1), e = [];
      const cut = (u, v, x0, y0, x1, y1) => { if ((u > 0) !== (v > 0)) { const t = u / (u - v); e.push([(x0 + (x1 - x0) * t) * cell, (y0 + (y1 - y0) * t) * cell]); } };
      cut(a, b, i, j, i + 1, j); cut(b, c, i + 1, j, i + 1, j + 1); cut(d, c, i, j + 1, i + 1, j + 1); cut(a, d, i, j, i, j + 1);
      for (let q = 0; q + 1 < e.length; q += 2) { ctx.moveTo(...e[q]); ctx.lineTo(...e[q + 1]); }
    }
    ctx.stroke(); ctx.lineWidth = 1;
    // 点：没标注的是小灰点，标注过的实心，这一轮新挑的带圈
    const lab = new Set(h.labeled), fresh = new Set(prev ? h.picked : []);
    const r = Math.max(2, w / 85);
    R.pool.forEach((d, i) => { if (lab.has(i)) return; ctx.fillStyle = P.mute; ctx.globalAlpha = .45; ctx.fillRect(X(d.x) - .75, Y(d.y) - .75, 1.5, 1.5); });
    ctx.globalAlpha = 1;
    R.pool.forEach((d, i) => {
      if (!lab.has(i)) return;
      ctx.fillStyle = d.c ? P.ink : P.ref; ctx.beginPath(); ctx.arc(X(d.x), Y(d.y), r, 0, 7); ctx.fill();
      if (fresh.has(i)) { ctx.strokeStyle = P.ok; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(d.x), Y(d.y), r + 3, 0, 7); ctx.stroke(); ctx.lineWidth = 1; }
    });
    ctx.strokeStyle = P.line || P.grid; ctx.strokeRect(.5, .5, w - 1, w - 1);
  }

  function draw() {
    const P = palette(fig), hR = R.rand[st.i], hA = R.al[st.i], pR = R.rand[st.i - 1], pA = R.al[st.i - 1];
    panel(cR, hR, pR, P); panel(cA, hA, pA, P);
    // 曲线
    const { ctx, w, h } = canvas2d(cC, 180);
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    const box = { x: 36, y: 10, w: w - 48, h: h - 36 }, xr = [0, R.budget], yr = [.7, 1];
    const { X, Y } = plot(ctx, box, {
      P, xr, yr, xticks: [0, 30, 60, 90, 120], yticks: [.7, .8, .9, 1], xlabel: '已标注',
      series: [
        { pts: R.rand.map(q => [q.n, q.acc]), color: P.mute, width: 2 },
        { pts: R.al.map(q => [q.n, q.acc]), color: P.ok, width: 2.4 },
      ],
    });
    gC = { X, box };
    const x = X(hA.n);
    ctx.strokeStyle = P.hand; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, box.y); ctx.lineTo(x, box.y + box.h); ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = P.hand; ctx.beginPath(); ctx.arc(x, box.y + box.h, 6, 0, 7); ctx.fill();
    [[hR.acc, P.mute], [hA.acc, P.ok]].forEach(([a, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, Y(Math.max(.7, a)), 4, 0, 7); ctx.fill(); });
    ctx.font = P.font; ctx.textAlign = 'left'; ctx.fillStyle = P.mute; ctx.fillText('准确率', box.x + 4, box.y + 11);

    // 读数
    nIn.max = R.al.length - 1; nIn.value = st.i;
    fig.querySelector('output[for=n]').textContent = `${hA.n} 张`;
    setK(String(st.k));
    const reach = (hs, a) => hs.find(q => q.acc >= a)?.n;
    const mean = (h, prev) => prev ? h.picked.reduce((s, i) => s + entropy(prob(prev.w, R.pool[i].x, R.pool[i].y)), 0) / h.picked.length : null;
    const eR = mean(hR, pR), eA = mean(hA, pA), pct = a => (a * 100).toFixed(1) + '%';
    const t95R = reach(R.rand, .95), t95A = reach(R.al, .95);
    out.innerHTML = `标注 <b>${hA.n}</b> 张时，测试集准确率：<br>随机 <b>${pct(hR.acc)}</b>，主动 <b class="ok">${pct(hA.acc)}</b>。<br>` +
      `到 95%：随机要 ${t95R ? `<b>${t95R}</b> 张` : '标到 120 张也<b>没到</b>'}，主动要 ${t95A ? `<b class="ok">${t95A}</b> 张` : '<b>没到</b>'}。` +
      (eA != null ? `<br>这一轮挑中的 ${hA.picked.length} 个点，在上一轮模型眼里的平均熵：随机 ${eR.toFixed(2)}，主动 <b class="ok">${eA.toFixed(2)}</b>（满分 1）。` : '<br>这是起始数据集：两边一样，各类 2 张。');
  }

  drag(cC, {
    hit: (x, y) => gC && x > gC.box.x - 10 && x < gC.box.x + gC.box.w + 10 && y > gC.box.y - 6 && y < gC.box.y + gC.box.h + 14 ? 1 : null,
    move: (_, x) => { const n = (x - gC.box.x) / gC.box.w * R.budget; st.i = clamp(nearest(n), 0, R.al.length - 1); draw(); },
  });
  nIn.addEventListener('input', () => { st.i = +nIn.value; draw(); });
  fig.querySelector('.reseed').addEventListener('click', () => { st.seed = (st.seed * 48271) % 2147483647; rerun(); });
  fig.api = {
    set(o = {}) {
      if (o.k && o.k !== st.k) { st.k = o.k; rerun(); }
      if (o.seed) { st.seed = o.seed; rerun(); }
      if (o.n != null) st.i = nearest(o.n);
      draw(); flash(fig);
    },
  };
  onResize(cC, draw);
}
