// 图：只用 NAND 搭门。点红色开关 A / B（或点真值表的行），信号沿线走：绿 = 1，灰 = 0。
import { palette, canvas2d, onResize, flash, seg } from '/assets/fig.js';

const nand = (a, b) => (a && b) ? 0 : 1;
// 每种门的搭法：坐标在 100 × 60 的格子里
export const CIRCUITS = {
  NOT: { inputs: ['A'], gates: [{ id: 'g1', x: 52, y: 30, in: ['A', 'A'] }], out: 'g1', want: (a) => a ? 0 : 1, f: 'NOT A' },
  AND: { inputs: ['A', 'B'], gates: [{ id: 'g1', x: 40, y: 30, in: ['A', 'B'] }, { id: 'g2', x: 70, y: 30, in: ['g1', 'g1'] }], out: 'g2', want: (a, b) => a & b, f: 'A AND B' },
  OR: { inputs: ['A', 'B'], gates: [{ id: 'g1', x: 38, y: 17, in: ['A', 'A'] }, { id: 'g2', x: 38, y: 43, in: ['B', 'B'] }, { id: 'g3', x: 70, y: 30, in: ['g1', 'g2'] }], out: 'g3', want: (a, b) => a | b, f: 'A OR B' },
  XOR: { inputs: ['A', 'B'], gates: [{ id: 'g1', x: 33, y: 30, in: ['A', 'B'] }, { id: 'g2', x: 57, y: 16, in: ['A', 'g1'] }, { id: 'g3', x: 57, y: 44, in: ['g1', 'B'] }, { id: 'g4', x: 81, y: 30, in: ['g2', 'g3'] }], out: 'g4', want: (a, b) => a ^ b, f: 'A XOR B' },
};
const IN_POS = { A: [7, 17], B: [7, 43] };

export function evaluate(c, A, B) {
  const v = { A, B };
  c.gates.forEach(g => { v[g.id] = nand(v[g.in[0]], v[g.in[1]]); });
  return v;
}

export default function mount(fig) {
  const cv = fig.querySelector('canvas.circuit'), table = fig.querySelector('.truth'), out = fig.querySelector('.readout');
  const st = { gate: 'XOR', A: 1, B: 0 };
  let hits = [];
  const setGate = seg(fig.querySelector('.seg'), v => { st.gate = v; draw(); });

  function draw() {
    const c = CIRCUITS[st.gate], P = palette(fig);
    const { ctx, w, h } = canvas2d(cv, Math.round(Math.min(340, Math.max(220, cv.clientWidth * .58))));
    const sx = w / 100, sy = h / 60, X = x => x * sx, Y = y => y * sy, gw = Math.min(10 * sx, 54), gh = Math.min(12 * sy, 46);
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    const v = evaluate(c, st.A, c.inputs.length > 1 ? st.B : 0);
    const inPos = c.inputs.length === 1 ? { A: [7, 30] } : IN_POS;
    const src = id => id in inPos ? [X(inPos[id][0]) + 26, Y(inPos[id][1])] : (() => { const g = c.gates.find(g => g.id === id); return [X(g.x) + gw / 2 + 7, Y(g.y)]; })();
    const wire = (from, to, val) => {
      const [x1, y1] = from, [x2, y2] = to, mx = x2 - 14;
      ctx.strokeStyle = val ? P.ok : P.mute; ctx.lineWidth = val ? 2.4 : 1.4;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(mx, y1); ctx.lineTo(mx, y2); ctx.lineTo(x2, y2); ctx.stroke();
      if (val) { ctx.fillStyle = P.ok; ctx.beginPath(); ctx.arc(mx, y1, 2.2, 0, 7); ctx.fill(); }
    };
    // 线先画，门盖在上面
    c.gates.forEach(g => g.in.forEach((s, k) => wire(src(s), [X(g.x) - gw / 2, Y(g.y) + (k ? 1 : -1) * gh * .25], v[s])));
    const lamp = [X(94), Y(30)];
    wire(src(c.out), [lamp[0] - 12, lamp[1]], v[c.out]);
    c.gates.forEach(g => {
      const x = X(g.x) - gw / 2, y = Y(g.y) - gh / 2;
      ctx.fillStyle = P.bg; ctx.strokeStyle = P.ink; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + gw / 2, y); ctx.arc(x + gw / 2, y + gh / 2, gh / 2, -Math.PI / 2, Math.PI / 2); ctx.lineTo(x, y + gh); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + gw / 2 + gh / 2 + 3.5, y + gh / 2, 3.5, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = P.mute; ctx.font = P.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('NAND', x + gw * .48, y + gh / 2);
    });
    // 输出灯
    ctx.fillStyle = v[c.out] ? P.ok : P.bg; ctx.strokeStyle = v[c.out] ? P.ok : P.mute; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(lamp[0], lamp[1], 11, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = v[c.out] ? '#fff' : P.mute; ctx.font = '600 12px ' + 'SF Mono, Menlo, monospace'; ctx.fillText(v[c.out], lamp[0], lamp[1] + .5);
    // 红色开关
    hits = [];
    Object.entries(inPos).forEach(([k, [px, py]]) => {
      const x = X(px) - 20, y = Y(py) - 13, val = st[k];
      ctx.fillStyle = val ? P.hand : P.bg; ctx.strokeStyle = P.hand; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.roundRect(x, y, 46, 26, 13); ctx.fill(); ctx.stroke();
      ctx.fillStyle = val ? '#fff' : P.hand; ctx.font = '600 12px -apple-system, sans-serif';
      ctx.fillText(`${k} = ${val}`, x + 23, y + 13.5);
      hits.push({ k, x, y, w: 46, h: 26 });
    });
    // 真值表
    const rows = c.inputs.length === 1 ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
    table.innerHTML = `<thead><tr>${c.inputs.map(i => `<th>${i}</th>`).join('')}<th>${c.f}</th></tr></thead><tbody>${rows.map(r => {
      const o = evaluate(c, r[0], r[1] ?? 0)[c.out], cur = r[0] === st.A && (r.length === 1 || r[1] === st.B);
      return `<tr data-a="${r[0]}" data-b="${r[1] ?? ''}" class="${cur ? 'cur' : ''}">${r.map(x => `<td>${x}</td>`).join('')}<td><b>${o}</b></td></tr>`;
    }).join('')}</tbody>`;
    const ok = rows.every(r => evaluate(c, r[0], r[1] ?? 0)[c.out] === c.want(r[0], r[1] ?? 0));
    out.innerHTML = `用了 <b class="ok">${c.gates.length} 个 NAND</b>。${ok ? `${rows.length} 行都和 ${c.f} 的真值表对得上。` : `<b class="bad">和 ${c.f} 对不上</b>。`}` + (st.gate === 'XOR' ? ' XOR 最省也要 4 个：中间那个 NAND 的输出被用了两次。' : '');
  }

  cv.addEventListener('pointerdown', e => {
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    const t = hits.find(s => x >= s.x - 4 && x <= s.x + s.w + 4 && y >= s.y - 4 && y <= s.y + s.h + 4);
    if (t) { st[t.k] ^= 1; draw(); }
  });
  cv.addEventListener('pointermove', e => {
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    cv.style.cursor = hits.some(s => x >= s.x - 4 && x <= s.x + s.w + 4 && y >= s.y - 4 && y <= s.y + s.h + 4) ? 'pointer' : 'default';
  });
  table.addEventListener('click', e => { const r = e.target.closest('tr[data-a]'); if (!r) return; st.A = +r.dataset.a; if (r.dataset.b) st.B = +r.dataset.b; draw(); });
  fig.api = { set(o = {}) { Object.assign(st, o); setGate(st.gate); draw(); flash(fig); } };
  setGate(st.gate);
  onResize(cv, draw);
}
