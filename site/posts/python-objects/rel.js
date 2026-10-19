// 图 1：type / object / 元类 的关系。点一个节点当第一个参数，再点一个当第二个参数，
// 看 isinstance、issubclass 怎么沿着“是实例”（虚线）和“是子类”（实线）走到答案。
import { palette, canvas2d, onResize, flash } from '/assets/fig.js';

// 和图注里那三行 Python 对应：class Meta(type)、class Person(metaclass=Meta)、p = Person()
const N = {
  object: { x: 50, y: 13, cls: true, type: 'type', base: null },
  type: { x: 87, y: 13, cls: true, type: 'type', base: 'object' },
  Meta: { x: 87, y: 34, cls: true, type: 'type', base: 'type' },
  Person: { x: 41, y: 34, cls: true, type: 'Meta', base: 'object' },
  int: { x: 59, y: 52, cls: true, type: 'type', base: 'object' },
  p: { x: 13, y: 34, cls: false, type: 'Person' },
  5: { x: 13, y: 52, cls: false, type: 'int' },
};
const mro = k => { const out = []; for (let c = k; c; c = N[c].base) out.push(c); return out; };
const isMeta = k => N[k].cls && mro(k).includes('type');
// 边：kind = sub（实线，子类 → 父类）或 inst（虚线，对象 → 它的类型）；bend 是曲线往哪边鼓
const EDGES = [
  ...Object.entries(N).filter(([, n]) => n.base).map(([k, n]) => ({ a: k, b: n.base, kind: 'sub' })),
  ...Object.entries(N).map(([k, n]) => ({ a: k, b: n.type, kind: 'inst' })),
];
// 同一对节点之间有两条边时，各往一边错开几像素
const OFF = { 'object>type:inst': 4, 'type>object:sub': 4, 'Meta>type:inst': 5, 'Meta>type:sub': -5 };

export default function mount(fig) {
  const cv = fig.querySelector('canvas'), out = fig.querySelector('.readout');
  const st = { a: 'Person', b: 'type' };
  let boxes = {}, hover = null;

  // 走法：isinstance(a, b) = a ⇢ type(a)，再沿 type(a) 的 MRO 往上；issubclass(a, b) = 沿 a 的 MRO 往上
  function walk(a, b) {
    const inst = N[b].cls && mro(N[a].type).includes(b);
    const sub = N[a].cls && N[b].cls && mro(a).includes(b);
    const chain = (from, to) => { const m = mro(from), i = m.indexOf(to); return m.slice(0, i + 1); };
    const instPath = inst ? [[a, N[a].type, 'inst'], ...pairs(chain(N[a].type, b), 'sub')] : [];
    const subPath = sub ? pairs(chain(a, b), 'sub') : [];
    return { inst, sub, instPath, subPath };
  }
  const pairs = (list, kind) => list.slice(1).map((c, i) => [list[i], c, kind]);

  function draw() {
    const P = palette(fig);
    const { ctx, w, h } = canvas2d(cv, Math.round(Math.min(310, Math.max(250, cv.clientWidth * .48))));
    const X = x => x / 100 * w, Y = y => (y + 4) / 66 * h;
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    ctx.font = P.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    [['实例', 13], ['类', 50], ['元类', 87]].forEach(([t, x]) => { ctx.fillStyle = P.mute; ctx.fillText(t, X(x), 10); });

    const r = st.b ? walk(st.a, st.b) : null;
    const lit = new Map();
    r?.instPath.forEach(([a, b, k]) => lit.set(`${a}>${b}:${k}`, 'inst'));
    r?.subPath.forEach(([a, b, k]) => lit.set(`${a}>${b}:${k}`, lit.has(`${a}>${b}:${k}`) ? 'both' : 'sub'));

    // 先量好每个节点的框
    ctx.font = '600 13px ' + 'SF Mono, Menlo, monospace';
    boxes = {};
    for (const [k, n] of Object.entries(N)) {
      const bw = Math.max(34, ctx.measureText(k).width + 18), bh = 26;
      boxes[k] = { x: X(n.x) - bw / 2, y: Y(n.y) - bh / 2, w: bw, h: bh, cx: X(n.x), cy: Y(n.y) };
    }
    // 边
    for (const e of EDGES) {
      const key = `${e.a}>${e.b}:${e.kind}`, on = lit.has(key);
      ctx.strokeStyle = on ? P.ok : P.mute; ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = on ? 2.6 : 1.2; ctx.setLineDash(e.kind === 'inst' ? [5, 4] : []);
      if (e.a === e.b) { loop(ctx, boxes[e.a]); ctx.setLineDash([]); continue; }
      edge(ctx, boxes[e.a], boxes[e.b], OFF[key] ?? 0);
      ctx.setLineDash([]);
    }
    // 节点：红边 = 能点；第一个参数实心红，第二个粗红框
    ctx.font = '600 13px ' + 'SF Mono, Menlo, monospace';
    for (const [k, b] of Object.entries(boxes)) {
      const isA = k === st.a, isB = k === st.b;
      ctx.fillStyle = isA ? P.hand : P.bg; ctx.strokeStyle = P.hand; ctx.lineWidth = isB ? 2.6 : isA ? 1.5 : 1.1;
      ctx.globalAlpha = isA || isB || hover === k ? 1 : .55;
      ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, N[k].cls ? 6 : 13); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = isA ? '#fff' : P.ink; ctx.fillText(k, b.cx, b.cy + .5);
      if (isA || isB) { ctx.font = P.font; ctx.fillStyle = P.hand; ctx.fillText(isA ? '①' : '②', b.x - 9, b.y + 2); ctx.font = '600 13px ' + 'SF Mono, Menlo, monospace'; }
    }
    // 图例
    ctx.font = P.font; ctx.textAlign = 'left'; ctx.fillStyle = P.mute; ctx.strokeStyle = P.mute; ctx.lineWidth = 1.2;
    const ly = h - 12, lx = 8;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 22, ly); ctx.stroke(); ctx.fillText('是子类', lx + 27, ly);
    ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(lx + 82, ly); ctx.lineTo(lx + 104, ly); ctx.stroke(); ctx.setLineDash([]); ctx.fillText('是实例（指向 type(x)）', lx + 109, ly);
    readout(r);
  }

  function readout(r) {
    const { a, b } = st, A = N[a];
    const code = s => `<code>${s}</code>`;
    const show = path => path.map(([x, y, k], i) => (i ? '' : x) + (k === 'inst' ? ' ⇢ ' : ' → ') + y).join('');
    let html = `${code(`type(${a})`)} 是 <b>${A.type}</b>` + (A.cls ? `；${code(`${a}.__mro__`)} = (${mro(a).join(', ')})` : '') + '。';
    if (isMeta(a)) html += ` MRO 以 type、object 结尾，<b>${a} 是元类</b>：它的实例本身又是类。`;
    if (!b) { out.innerHTML = html + '<br>再点一个节点当第二个参数。'; return; }
    const B = N[b];
    html += '<br>' + code(`isinstance(${a}, ${b})`) + ' → ' + (!B.cls
      ? '<b class="bad">TypeError</b>：第二个参数得是类'
      : r.inst ? `<b class="ok">True</b>　${show(r.instPath)}` : `<b>False</b>　${a} ⇢ ${A.type} 往上的 MRO 里没有 ${b}`);
    html += '<br>' + code(`issubclass(${a}, ${b})`) + ' → ' + (!A.cls
      ? `<b class="bad">TypeError</b>：${a} 不是类，没有 MRO`
      : !B.cls ? '<b class="bad">TypeError</b>：第二个参数得是类'
      : r.sub ? `<b class="ok">True</b>　${show(r.subPath)}` : `<b>False</b>　${a} 的 MRO 里没有 ${b}`);
    out.innerHTML = html;
  }

  const at = (x, y) => Object.entries(boxes).find(([, b]) => x >= b.x - 4 && x <= b.x + b.w + 4 && y >= b.y - 4 && y <= b.y + b.h + 4)?.[0] ?? null;
  const pos = e => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  cv.addEventListener('pointerdown', e => {
    const k = at(...pos(e)); if (k == null) return;
    if (st.b != null || st.a == null) { st.a = k; st.b = null; } else st.b = k;
    draw();
  });
  cv.addEventListener('pointermove', e => { const k = at(...pos(e)); cv.style.cursor = k ? 'pointer' : 'default'; if (k !== hover) { hover = k; draw(); } });
  cv.addEventListener('pointerleave', () => { if (hover) { hover = null; draw(); } });
  fig.querySelector('.swap')?.addEventListener('click', () => { if (st.b) { [st.a, st.b] = [st.b, st.a]; draw(); } });
  fig.api = { set(o = {}) { if (o.a in N) { st.a = o.a; st.b = null; } if (o.b in N) st.b = o.b; draw(); flash(fig); } };
  onResize(cv, draw);
}

// 从框 a 的边到框 b 的边画一条直线（off：垂直方向错开几像素），末端带箭头
function edge(ctx, a, b, off) {
  const dx = b.cx - a.cx, dy = b.cy - a.cy, L = Math.hypot(dx, dy), nx = -dy / L * off, ny = dx / L * off;
  const s = [a.cx + nx, a.cy + ny], t = [b.cx + nx, b.cy + ny];
  const p0 = exit(a, s, t), p1 = exit(b, t, s);
  ctx.beginPath(); ctx.moveTo(...p0); ctx.lineTo(...p1); ctx.stroke();
  const ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
  ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(...p1);
  ctx.lineTo(p1[0] - 8 * Math.cos(ang - .4), p1[1] - 8 * Math.sin(ang - .4)); ctx.lineTo(p1[0] - 8 * Math.cos(ang + .4), p1[1] - 8 * Math.sin(ang + .4)); ctx.closePath(); ctx.fill();
}
// 从框里的点 from 朝 toward 走，停在框边外 3px
function exit(b, from, toward) {
  const dx = toward[0] - from[0], dy = toward[1] - from[1], hw = b.w / 2 + 3, hh = b.h / 2 + 3;
  let t = Infinity;
  if (dx) t = Math.min(t, ((dx > 0 ? b.cx + hw : b.cx - hw) - from[0]) / dx);
  if (dy) t = Math.min(t, ((dy > 0 ? b.cy + hh : b.cy - hh) - from[1]) / dy);
  return [from[0] + dx * t, from[1] + dy * t];
}
// type 指向自己：框右上角一个小圈
function loop(ctx, b) {
  const x = b.x + b.w, y = b.y + 4;
  ctx.beginPath(); ctx.moveTo(x - 8, b.y - 1); ctx.bezierCurveTo(x - 6, b.y - 24, x + 24, y - 8, x + 3, y + 5); ctx.stroke();
  ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(x + 3, y + 5); ctx.lineTo(x + 12, y + 2); ctx.lineTo(x + 8, y + 11); ctx.closePath(); ctx.fill();
}
