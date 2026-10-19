// 图：二阶对象 ÿ = u + d(t)。上面三条是 y 跟 r、放大的误差 e、控制量 u；下面是 (e, ė) 相平面。
// 换控制器、拖滑块；相平面里的红点是初始状态，能拖。api.set({ mode, ref, K, c, delta, phi, D, sig, e0 }) 给正文的“试试”。
import { palette, canvas2d, drag, onResize, clamp, seg, flash, fmt } from '/assets/fig.js';
import { simulate, T, TS, N } from './sim.js';

const NAME = { bang: 'Bang-bang', hys: '滞环', bl: '边界层', ismc: '积分滑模', sta: '超螺旋' };
const START = { step: [-1, 0], sine: [0, -1.2] };   // 从静止出发：y = 0、ẏ = 0
const E = 1.4, ED = 2.8;                            // 相平面的范围：e ∈ ±1.4，ė ∈ ±2.8

export default function mount(fig) {
  const tc = fig.querySelector('canvas.time'), pc = fig.querySelector('canvas.phase'), out = fig.querySelector('.readout');
  const inputs = Object.fromEntries([...fig.querySelectorAll('input[type=range]')].map(i => [i.name, i]));
  const st = { mode: 'bang', ref: 'step', e0: START.step.slice() };
  for (const k in inputs) st[k] = +inputs[k].value;
  let res, gp;

  const setMode = seg(fig.querySelector('.seg[data-k=mode]'), v => { st.mode = v; run(); });
  const setRef = seg(fig.querySelector('.seg[data-k=ref]'), v => { st.ref = v; st.e0 = START[v].slice(); run(); });

  function run() {
    res = simulate(st);
    fig.querySelector('.ctl.delta').hidden = st.mode !== 'hys';
    fig.querySelector('.ctl.phi').hidden = !(st.mode === 'bl' || st.mode === 'ismc');
    for (const k in inputs) { inputs[k].value = st[k]; fig.querySelector(`output[for=${k}]`).textContent = fmt(st[k], 3); }
    setMode(st.mode); setRef(st.ref);
    draw(); say();
  }

  // 一列像素里取最小和最大：开关打得再密，也能画成一整块
  function trace(ctx, arr, x0, w, Y, from = 0) {
    const n = arr.length, step = n / w;
    ctx.beginPath();
    for (let px = Math.floor(from / step); px < w; px++) {
      const i0 = Math.floor(px * step), i1 = Math.min(n, Math.max(i0 + 1, Math.floor((px + 1) * step)));
      let mn = Infinity, mx = -Infinity;
      for (let i = i0; i < i1; i++) { const v = arr[i]; if (v < mn) mn = v; if (v > mx) mx = v; }
      const up = arr[i1 - 1] >= arr[i0];
      ctx.lineTo(x0 + px, Y(up ? mn : mx)); ctx.lineTo(x0 + px + .5, Y(up ? mx : mn));
    }
    ctx.stroke();
  }

  function draw() {
    const P = palette(fig);
    // ---- 三条时间曲线 ----
    {
      const { ctx, w } = canvas2d(tc, 330), L = 48, W = w - L - 6, X = t => L + t / T * W;
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, 330); ctx.font = P.font; ctx.lineWidth = 1;
      const bands = [{ top: 8, h: 110 }, { top: 138, h: 70 }, { top: 228, h: 82 }];
      // 后一半时间是算稳态误差的那段
      ctx.fillStyle = P.grid; ctx.fillRect(X(T / 2), bands[1].top, X(T) - X(T / 2), bands[1].h);
      const Yof = (b, lo, hi) => v => b.top + b.h - (clamp(v, lo, hi) - lo) / (hi - lo) * b.h;
      const axis = (b, Y, ticks, label) => {
        ctx.strokeStyle = P.grid; ctx.fillStyle = P.mute; ctx.textAlign = 'right';
        ticks.forEach(([v, s]) => { ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(L + W, Y(v)); ctx.stroke(); ctx.fillText(s, L - 4, Y(v) + 4); });
        ctx.textAlign = 'left'; ctx.fillText(label, L + 4, b.top + 11);
      };
      // y 和 r
      const yr = st.ref === 'step' ? [-0.2, 1.4] : [-1.4, 1.4], Y1 = Yof(bands[0], ...yr);
      axis(bands[0], Y1, st.ref === 'step' ? [[0, '0'], [1, '1']] : [[-1, '−1'], [0, '0'], [1, '1']], '');
      ctx.strokeStyle = P.ref; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; trace(ctx, res.r, L, W, Y1); ctx.setLineDash([]);
      ctx.strokeStyle = P.ink; ctx.lineWidth = 1.6; trace(ctx, res.y, L, W, Y1); ctx.lineWidth = 1;
      ctx.textAlign = 'left'; ctx.fillStyle = P.ink; ctx.fillText('y', L + 4, bands[0].top + 11); ctx.fillStyle = P.ref; ctx.fillText('r（虚线）', L + 16, bands[0].top + 11);
      // e：按后一半时间的大小自动放大，前面的大误差截在边上
      let m = 0; for (let i = N / 2; i < N; i++) m = Math.max(m, Math.abs(res.e[i]));
      const em = niceUp(Math.max(m * 1.25, 1e-3)), Y2 = Yof(bands[1], -em, em);
      axis(bands[1], Y2, [[em, '+' + fmt(em, 4)], [0, '0'], [-em, '−' + fmt(em, 4)]], '');
      ctx.strokeStyle = P.ok; ctx.lineWidth = 1.3; trace(ctx, res.e, L, W, Y2); ctx.lineWidth = 1;
      ctx.fillStyle = P.ok; ctx.textAlign = 'left'; ctx.fillText('e = y − r（放大看）', L + 4, bands[1].top + 11);
      ctx.fillStyle = P.mute; ctx.textAlign = 'right'; ctx.fillText('稳态误差按这段算', L + W - 4, bands[1].top + 11);
      // u
      const Y3 = Yof(bands[2], -st.K * 1.15, st.K * 1.15);
      axis(bands[2], Y3, [[st.K, '+K'], [0, '0'], [-st.K, '−K']], '');
      ctx.strokeStyle = P.ink; ctx.globalAlpha = .85; trace(ctx, res.u, L, W, Y3); ctx.globalAlpha = 1;
      ctx.fillStyle = P.ink; ctx.textAlign = 'left'; ctx.fillText('u', L + 4, bands[2].top + 11);
      ctx.fillStyle = P.mute; ctx.textAlign = 'center';
      for (let t = 0; t <= T; t++) ctx.fillText(t + (t === T ? ' s' : ''), Math.min(X(t), L + W - 8), 326);
    }
    // ---- 相平面 ----
    {
      const size = Math.min(pc.clientWidth, 300), { ctx, w, h } = canvas2d(pc, size), pad = 6;
      const X = e => pad + (e + E) / (2 * E) * (w - 2 * pad), Y = d => pad + (ED - d) / (2 * ED) * (h - 2 * pad);
      gp = { X, Y, w, h, pad };
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h); ctx.font = P.font;
      ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(X(-E), Y(0)); ctx.lineTo(X(E), Y(0)); ctx.moveTo(X(0), Y(-ED)); ctx.lineTo(X(0), Y(ED)); ctx.stroke();
      // 滑模面 s = c·e + ė = 0，以及滞环带 / 边界层
      const band = st.mode === 'hys' ? st.delta : (st.mode === 'bl' || st.mode === 'ismc') ? st.phi : 0;
      const line = off => { ctx.beginPath(); ctx.moveTo(X(-E), Y(off + st.c * E)); ctx.lineTo(X(E), Y(off - st.c * E)); };
      if (band > 0) {
        ctx.beginPath(); ctx.moveTo(X(-E), Y(band + st.c * E)); ctx.lineTo(X(E), Y(band - st.c * E)); ctx.lineTo(X(E), Y(-band - st.c * E)); ctx.lineTo(X(-E), Y(-band + st.c * E)); ctx.closePath();
        ctx.fillStyle = P.ref; ctx.globalAlpha = .12; ctx.fill(); ctx.globalAlpha = 1;
      }
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
      ctx.strokeStyle = P.ref; ctx.lineWidth = 1.5; line(0); ctx.stroke(); ctx.lineWidth = 1;
      // 轨迹
      ctx.strokeStyle = P.ok; ctx.lineWidth = 1.6; ctx.beginPath();
      for (let i = 0; i < N; i += 2) { const x = X(clamp(res.e[i], -E * 1.2, E * 1.2)), y = Y(clamp(res.ed[i], -ED * 1.2, ED * 1.2)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.lineWidth = 1; ctx.restore();
      ctx.fillStyle = P.mute; ctx.textAlign = 'right'; ctx.fillText('e', w - pad - 2, Y(0) - 5); ctx.textAlign = 'left'; ctx.fillText('ė', X(0) + 5, pad + 11);
      const le = Math.max(-E, -ED / st.c) * .8; ctx.fillStyle = P.ref; ctx.fillText('s = 0', X(le) + 8, Y(-st.c * le) + 4);
      const [e0, d0] = st.e0, x0 = X(e0), y0 = Y(d0);
      ctx.fillStyle = P.hand; ctx.globalAlpha = .16; ctx.beginPath(); ctx.arc(x0, y0, 12, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(x0, y0, 5.5, 0, 7); ctx.fill();
    }
  }

  function say() {
    const dmax = 1.3 * st.D, ok = v => `<b class="ok">${v}</b>`, bad = v => `<b class="bad">${v}</b>`;
    const lost = st.K <= dmax;
    let s = `${NAME[st.mode]}：6 秒里 u 满幅翻转 ${lost ? bad(res.flips + ' 次') : ok(res.flips + ' 次')}，后 3 秒误差 RMS ${ok(fmtS(res.rms))}（平均偏 ${fmtS(res.bias, true)}）。`;
    if (lost) s += `K = ${fmt(st.K)} 不比扰动上界 ${fmt(dmax)} 大，${bad('滑模面守不住')}，y 被扰动推走了。`;
    else if (st.mode === 'bang') s += `每个采样周期都可能翻一次，上限是 ${N / 2} 次（${1 / TS / 2} Hz）。`;
    else if (st.mode === 'hys') { const Tsw = 2 * st.delta / (st.K - st.D) + 2 * st.delta / (st.K + st.D); s += st.delta > 0 ? `带宽 2Δ = ${fmt(2 * st.delta, 3)}，估算一来一回 ≈ ${fmt(Tsw * 1000, 1)} ms，6 秒约 ${Math.round(2 * T / Tsw)} 次。` : 'Δ = 0 就是 Bang-bang。'; }
    else if (st.mode === 'bl') s += `边界层里是 PD：K<sub>p</sub> = Kc/Φ = ${fmt(st.K * st.c / st.phi, 1)}，K<sub>d</sub> = K/Φ = ${fmt(st.K / st.phi, 1)}；常值扰动下估算稳态误差 Φd/(Kc) ≈ ${fmtS(st.phi * st.D / (st.K * st.c))}。`;
    else if (st.mode === 'ismc') s += '积分项替边界层扛住了常值扰动，平均偏差回到 0 附近。';
    else s += 'u 是连续的，又不靠边界层，误差和偏置都小。';
    if (res.reach != null && !lost) s += ` 到达 s ≈ 0 用了 ${fmt(res.reach, 2)} s。`;
    out.innerHTML = s;
  }

  for (const k in inputs) inputs[k].addEventListener('input', () => { st[k] = +inputs[k].value; run(); });
  drag(pc, {
    hit: (x, y) => Math.hypot(x - gp.X(st.e0[0]), y - gp.Y(st.e0[1])) < 18 ? 1 : null,
    move: (_, x, y) => {
      const e = (x - gp.pad) / (gp.w - 2 * gp.pad) * 2 * E - E, d = ED - (y - gp.pad) / (gp.h - 2 * gp.pad) * 2 * ED;
      st.e0 = [clamp(e, -E, E), clamp(d, -ED, ED)]; run();
    },
  });
  fig.api = {
    set(o = {}) {
      if (o.ref && o.ref !== st.ref && !o.e0) st.e0 = START[o.ref].slice();
      Object.assign(st, o); run(); flash(fig);
    },
  };
  res = simulate(st);
  onResize(tc, run);
}

const niceUp = v => { const p = 10 ** Math.floor(Math.log10(v)), m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; };
function fmtS(v, sign) { const a = Math.abs(v), s = a >= 0.1 ? a.toFixed(2) : a >= 0.001 ? a.toFixed(4) : a.toExponential(1); return (sign ? (v < 0 ? '−' : '+') : v < 0 ? '−' : '') + s; }
