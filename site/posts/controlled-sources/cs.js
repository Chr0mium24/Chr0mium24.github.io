// 图：四种受控源。左边是控制支路（一个可调的电压或电流），右边是受控源带一个负载 R_L。
// 拖控制量、增益、负载，看输出：受控“电压”源的输出电压不随负载变，受控“电流”源的输出电流不随负载变。
import { palette, canvas2d, onResize, flash, seg, clamp } from '/assets/fig.js';

// 默认值照正文里四段 lcapy 代码：控制量 1 V / 1 A / 1 mA，增益 5、0.1 S、50 Ω、100，负载 1k、50、1k、500
export const KINDS = {
  E: { name: '压控电压源 VCVS', ctrl: 'v', out: 'v', g: 5, gMax: 20, gUnit: '', gSym: 'K', c: 1, cMax: 2, cScale: 1, RL: 1000 },
  G: { name: '压控电流源 VCCS', ctrl: 'v', out: 'i', g: .1, gMax: .2, gUnit: 'S', gSym: 'G_m', c: 1, cMax: 2, cScale: 1, RL: 50 },
  H: { name: '流控电压源 CCVS', ctrl: 'i', out: 'v', g: 50, gMax: 200, gUnit: 'Ω', gSym: 'R_m', c: 1, cMax: 2, cScale: 1, RL: 1000 },
  F: { name: '流控电流源 CCCS', ctrl: 'i', out: 'i', g: 100, gMax: 200, gUnit: '', gSym: 'β', c: 1, cMax: 2, cScale: 1e-3, RL: 500 },
};
const PRE = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'μ']];
export function si(v, unit) {
  if (!isFinite(v)) return '∞ ' + unit;
  if (v === 0) return '0 ' + unit;
  const a = Math.abs(v), [k, p] = PRE.find(([k]) => a >= k * .9995) ?? PRE[PRE.length - 1];
  return `${+(v / k).toPrecision(3)} ${p}${unit}`;
}
export function solve(kind, c, g, RL) {
  const K = KINDS[kind];
  const x = K.ctrl === 'v' ? c : c * K.cScale;      // 控制量（SI）
  if (K.out === 'v') { const v = g * x; return { v, i: v / RL }; }
  const i = g * x; return { i, v: i * RL };
}

export default function mount(fig) {
  const cv = fig.querySelector('canvas.ckt'), pl = fig.querySelector('canvas.plot'), out = fig.querySelector('.readout');
  const inC = fig.querySelector('input[name=c]'), inG = fig.querySelector('input[name=g]'), inR = fig.querySelector('input[name=rl]');
  const oC = fig.querySelector('output[for=c]'), oG = fig.querySelector('output[for=g]'), oR = fig.querySelector('output[for=rl]');
  const lC = fig.querySelector('.lab-c'), lG = fig.querySelector('.lab-g');
  const st = { kind: 'E', c: 1, g: 5, RL: 1000 };
  const setKind = seg(fig.querySelector('.seg'), v => pick(v));
  // R_L 的滑块是对数刻度：10 Ω … 10 kΩ
  const rToS = R => Math.log10(R / 10) / 3 * 1000, sToR = s => 10 * 10 ** (s / 1000 * 3);

  function pick(k, keep) {
    const K = KINDS[k]; st.kind = k;
    if (!keep) { st.c = K.c; st.g = K.g; st.RL = K.RL; }
    inC.min = -K.cMax; inC.max = K.cMax; inC.step = K.cMax / 100;
    inG.min = 0; inG.max = K.gMax; inG.step = K.gMax / 200;
    sync(); draw();
  }
  function sync() {
    const K = KINDS[st.kind];
    inC.value = st.c; inG.value = st.g; inR.value = rToS(st.RL);
    lC.textContent = K.ctrl === 'v' ? '控制电压' : '控制电流'; lG.textContent = `增益 ${K.gSym.replace('_', '')}`;
    oC.textContent = K.ctrl === 'v' ? si(st.c, 'V') : si(st.c * K.cScale, 'A');
    oG.textContent = K.gUnit ? si(st.g, K.gUnit) : String(+st.g.toPrecision(3));
    oR.textContent = si(st.RL, 'Ω');
  }

  function draw() {
    const P = palette(fig), K = KINDS[st.kind], r = solve(st.kind, st.c, st.g, st.RL);
    const { ctx, w, h } = canvas2d(cv, Math.round(clamp(cv.clientWidth * .42, 200, 250)));
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    const yT = 46, yB = h - 34, xs = w * .1, xr = w * .32, xd = w * .62, xl = w * .88;
    ctx.lineWidth = 1.6; ctx.strokeStyle = P.ink; ctx.fillStyle = P.ink; ctx.font = P.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    // 左：控制支路
    wire(ctx, [[xs, yT], [xr, yT]]); wire(ctx, [[xs, yB], [xr, yB]]);
    wire(ctx, [[xr, yT], [xr, yB]], [yT + (yB - yT) * .3, yT + (yB - yT) * .7]);
    if (K.ctrl === 'v') {
      srcCircle(ctx, xs, (yT + yB) / 2, 'v', P.hand); wire(ctx, [[xs, yT], [xs, (yT + yB) / 2 - 16]]); wire(ctx, [[xs, (yT + yB) / 2 + 16], [xs, yB]]);
      resistor(ctx, xr, yT + (yB - yT) * .3, yT + (yB - yT) * .7); ctx.fillText('R1', xr + 18, (yT + yB) / 2);
      vlabel(ctx, xr - 16, yT + 14, yB - 14, 'v_c', P.hand, P);
    } else {
      srcCircle(ctx, xs, (yT + yB) / 2, 'i', P.hand); wire(ctx, [[xs, yT], [xs, (yT + yB) / 2 - 16]]); wire(ctx, [[xs, (yT + yB) / 2 + 16], [xs, yB]]);
      // 0 V 的“电流传感器”
      const ym = (yT + yB) / 2; ctx.strokeStyle = P.mute; ctx.beginPath(); ctx.arc(xr, ym, 13, 0, 7); ctx.stroke(); ctx.fillStyle = P.mute; ctx.fillText('0 V', xr, ym + .5);
      ctx.strokeStyle = P.ink; wire(ctx, [[xr, yT + (yB - yT) * .3], [xr, ym - 13]]); wire(ctx, [[xr, ym + 13], [xr, yB - (yB - yT) * .3]]);
      if (w > 420) { ctx.fillStyle = P.mute; ctx.textAlign = 'right'; ctx.fillText('Vsense', xr - 17, ym); ctx.textAlign = 'center'; }
      arrow(ctx, (xs + xr) / 2 - 12, yT, (xs + xr) / 2 + 12, yT, P.hand); ctx.fillStyle = P.hand; ctx.fillText('i_c', (xs + xr) / 2, yT - 13);
    }
    // 中间：控制关系的虚线
    ctx.strokeStyle = P.ref; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(xr + 26, (yT + yB) / 2); ctx.lineTo(xd - 28, (yT + yB) / 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = P.ref; ctx.fillText(`× ${K.gSym.replace('_', '')}`, (xr + xd) / 2 + 4, (yT + yB) / 2 - 11);
    // 右：受控源 + 负载
    ctx.strokeStyle = P.ink; ctx.lineWidth = 1.6;
    wire(ctx, [[xd, yT], [xl, yT]]); wire(ctx, [[xd, yB], [xl, yB]]);
    const ym = (yT + yB) / 2;
    wire(ctx, [[xd, yT], [xd, ym - 22]]); wire(ctx, [[xd, ym + 22], [xd, yB]]);
    diamond(ctx, xd, ym, K.out, P);
    wire(ctx, [[xl, yT], [xl, yT + (yB - yT) * .3]]); wire(ctx, [[xl, yB - (yB - yT) * .3], [xl, yB]]);
    resistor(ctx, xl, yT + (yB - yT) * .3, yB - (yB - yT) * .3); ctx.fillStyle = P.ink; ctx.textAlign = 'right'; ctx.fillText('R_L', xl - 12, ym); ctx.textAlign = 'center';
    ctx.fillStyle = P.mute; ctx.textAlign = 'right'; ctx.fillText(st.kind + '1', xd - 20, ym - 22); ctx.textAlign = 'center';
    // 输出：电压标在负载旁，电流标在上面的线上
    const fixedV = K.out === 'v';
    vlabel(ctx, xl + 16, yT + 14, yB - 14, 'v_o', P.ok, P, true);
    arrow(ctx, (xd + xl) / 2 - 12, yT, (xd + xl) / 2 + 12, yT, P.ok);
    ctx.fillStyle = P.ok; ctx.font = '600 12px -apple-system, sans-serif';
    ctx.fillText(`i = ${si(r.i, 'A')}`, (xd + xl) / 2, yT - 14);
    ctx.textAlign = 'right'; ctx.fillText(`v_o = ${si(r.v, 'V')}`, w - 4, yB + 20); ctx.textAlign = 'center';
    ctx.font = P.font; ctx.fillStyle = P.mute; ctx.textAlign = 'left';
    ctx.fillText(fixedV ? '受控的是电压：v_o 只看控制量' : '受控的是电流：i 只看控制量', 4, yB + 20);
    plot(r);
    const c = K.ctrl === 'v' ? si(st.c, 'V') : si(st.c * K.cScale, 'A'), gs = K.gUnit ? si(st.g, K.gUnit) : +st.g.toPrecision(3);
    out.innerHTML = `<b>${K.name}</b><br>` + (fixedV
      ? `v<sub>o</sub> = ${K.gSym.replace('_', '')} × ${K.ctrl === 'v' ? 'v' : 'i'}<sub>c</sub> = ${gs} × ${c} = <b class="ok">${si(r.v, 'V')}</b><br>负载只决定电流：i = v<sub>o</sub> / R<sub>L</sub> = ${si(r.i, 'A')}`
      : `i = ${K.gSym.replace('_', '')} × ${K.ctrl === 'v' ? 'v' : 'i'}<sub>c</sub> = ${gs} × ${c} = <b class="ok">${si(r.i, 'A')}</b><br>负载只决定电压：v<sub>o</sub> = i × R<sub>L</sub> = ${si(r.v, 'V')}`);
  }

  // 下面两张小图：R_L 从 10 Ω 扫到 10 kΩ，输出电压、输出电流各怎么变
  function plot(r) {
    const P = palette(fig), { ctx, w, h } = canvas2d(pl, 120), K = KINDS[st.kind];
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    const half = (w - 16) / 2;
    [['v', 'v_o', 'V'], ['i', 'i', 'A']].forEach(([key, lab, unit], j) => {
      const x0 = j * (half + 16) + 6, x1 = x0 + half - 6, y0 = 18, y1 = h - 18;
      const R = s => sToR(s), pts = [];
      for (let s = 0; s <= 1000; s += 10) pts.push([s, solve(st.kind, st.c, st.g, R(s))[key]]);
      const vmax = Math.max(1e-12, ...pts.map(p => Math.abs(p[1])));
      const pos = pts.every(p => p[1] >= 0), neg = pts.every(p => p[1] <= 0), base = pos ? y1 : neg ? y0 : (y0 + y1) / 2, sc = pos || neg ? y1 - y0 : (y1 - y0) / 2;
      const X = s => x0 + s / 1000 * (x1 - x0), Y = v => base - v / vmax * sc;
      ctx.strokeStyle = P.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, base); ctx.lineTo(x1, base); ctx.stroke();
      ctx.strokeStyle = P.ok; ctx.lineWidth = 2; ctx.beginPath(); pts.forEach(([s, v], i) => i ? ctx.lineTo(X(s), Y(v)) : ctx.moveTo(X(s), Y(v))); ctx.stroke();
      const sNow = rToS(st.RL), vNow = r[key];
      ctx.fillStyle = P.ok; ctx.beginPath(); ctx.arc(X(sNow), Y(vNow), 4, 0, 7); ctx.fill();
      ctx.font = P.font; ctx.fillStyle = P.mute; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const flat = (K.out === 'v') === (key === 'v');
      ctx.fillText(`${lab} 随 R_L（${flat ? '不变' : key === 'v' ? '正比' : '反比'}）`, x0, 8);
      ctx.fillText('10 Ω', x0, h - 6); ctx.textAlign = 'right'; ctx.fillText('10 kΩ', x1, h - 6);
    });
  }

  inC.addEventListener('input', () => { st.c = +inC.value; sync(); draw(); });
  inG.addEventListener('input', () => { st.g = +inG.value; sync(); draw(); });
  inR.addEventListener('input', () => { st.RL = +sToR(+inR.value).toPrecision(3); sync(); draw(); });
  fig.api = {
    set(o = {}) {
      if (o.kind) { setKind(o.kind); pick(o.kind); }
      if (o.c != null) st.c = o.c; if (o.g != null) st.g = o.g; if (o.RL != null) st.RL = o.RL;
      sync(); draw(); flash(fig);
    },
  };
  setKind('E'); pick('E');
  onResize(cv, draw);
}

function wire(ctx, pts, gap) {
  ctx.beginPath();
  if (gap) { ctx.moveTo(...pts[0]); ctx.lineTo(pts[0][0], gap[0]); ctx.moveTo(pts[0][0], gap[1]); ctx.lineTo(...pts[1]); }
  else pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p));
  ctx.stroke();
}
function resistor(ctx, x, y0, y1) {
  ctx.beginPath(); ctx.moveTo(x, y0);
  const n = 6, d = (y1 - y0) / n;
  for (let k = 0; k < n; k++) ctx.lineTo(x + (k % 2 ? -6 : 6), y0 + d * (k + .5));
  ctx.lineTo(x, y1); ctx.stroke();
}
function srcCircle(ctx, x, y, kind, col) {
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 16, 0, 7); ctx.stroke();
  if (kind === 'v') { ctx.font = '600 13px sans-serif'; ctx.fillText('+', x, y - 7); ctx.fillText('−', x, y + 8); }
  else { ctx.beginPath(); ctx.moveTo(x, y + 9); ctx.lineTo(x, y - 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(x - 4, y - 3); ctx.lineTo(x + 4, y - 3); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function diamond(ctx, x, y, kind, P) {
  ctx.save(); ctx.strokeStyle = P.ink; ctx.fillStyle = P.bg; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(x, y - 22); ctx.lineTo(x + 18, y); ctx.lineTo(x, y + 22); ctx.lineTo(x - 18, y); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = P.ink;
  if (kind === 'v') { ctx.font = '600 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('+', x, y - 9); ctx.fillText('−', x, y + 10); }
  else { ctx.beginPath(); ctx.moveTo(x, y + 10); ctx.lineTo(x, y - 6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y - 11); ctx.lineTo(x - 4, y - 3); ctx.lineTo(x + 4, y - 3); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function arrow(ctx, x0, y0, x1, y1, col) {
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  const a = Math.atan2(y1 - y0, x1 - x0); ctx.beginPath(); ctx.moveTo(x1 + 3 * Math.cos(a), y1 + 3 * Math.sin(a));
  ctx.lineTo(x1 - 7 * Math.cos(a - .5), y1 - 7 * Math.sin(a - .5)); ctx.lineTo(x1 - 7 * Math.cos(a + .5), y1 - 7 * Math.sin(a + .5)); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// 电压标注：上 +、下 −，中间写名字
function vlabel(ctx, x, y0, y1, name, col, P, right) {
  ctx.save(); ctx.fillStyle = col; ctx.font = '600 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('+', x, y0 + 4); ctx.fillText('−', x, y1 - 4);
  ctx.font = '600 12px -apple-system, sans-serif'; ctx.textAlign = right ? 'left' : 'right'; ctx.fillText(name, x + (right ? -4 : 6), (y0 + y1) / 2);
  ctx.restore();
}
