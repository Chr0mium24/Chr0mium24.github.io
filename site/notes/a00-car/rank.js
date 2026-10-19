// 速查图：拖价格 / 续航 / 快充 / 安全的权重，五款车按表里的数据重新排。
// 打分（0–1）：价格 3 万 → 1、7 万 → 0；续航 150 km → 0、400 km → 1；快充 有 1 / 无 0；
// 安全按表里的描述分三档：单气囊 1/3，双气囊 2/3，双气囊且车身轮胎最宽（安全性得分最高）1。
import { flash, clamp } from '/assets/fig.js';

export const CARS = [
  { name: '奔腾小马', ver: '222闪电马', price: 37900, range: 222, fast: 0, safe: 1, safeT: '单气囊' },
  { name: '长安Lumin（糯玉米）', ver: '205乘风版', price: 48900, range: 205, fast: 0, safe: 3, safeT: '双气囊、车身最宽' },
  { name: '五菱宏光MINI EV（MINI 3）', ver: '215青春版', price: 39800, range: 215, fast: 0, safe: 2, safeT: '双气囊' },
  { name: '熊猫骑士（吉利熊猫mini）', ver: '210熊猫骑士版', price: 46900, range: 210, fast: 1, safe: 2, safeT: '双气囊', fastT: '22kW 快充' },
  { name: '零跑T03', ver: '高续航版', price: 65000, priceT: '约 6–7 万', range: 403, fast: 1, safe: 2, safeT: '安全性好', over: true },
];
const KEYS = [['price', '价格'], ['range', '续航'], ['fast', '快充'], ['safe', '安全']];
export const score = (c, w) => {
  const s = { price: clamp((70000 - c.price) / 40000, 0, 1), range: clamp((c.range - 150) / 250, 0, 1), fast: c.fast, safe: c.safe / 3 };
  const W = w.reduce((a, b) => a + b, 0) || 1;
  return 100 * KEYS.reduce((t, [k], i) => t + (w.some(Boolean) ? w[i] : 1) * s[k], 0) / (w.some(Boolean) ? W : 4);
};

export default function (fig) {
  const ins = KEYS.map(([k]) => fig.querySelector(`input[name=${k}]`)), board = fig.querySelector('.rank'), over = fig.querySelector('.over'), out = fig.querySelector('.readout');
  const st = { w: [3, 2, 1, 2], over: false };
  board.innerHTML = CARS.map((c, i) => `<div class="car" data-i="${i}"><div class="top"><span class="no"></span><b>${c.name}</b><span class="ver">${c.ver}</span><span class="pts"></span></div><div class="bar"><i></i></div><div class="spec">${c.priceT || '¥' + c.price.toLocaleString()} · ${c.range} km · ${c.fastT || (c.fast ? '支持快充' : '慢充')} · ${c.safeT}</div></div>`).join('');
  const rows = [...board.children];

  function draw() {
    ins.forEach((inp, i) => { inp.value = st.w[i]; fig.querySelector(`output[for=${KEYS[i][0]}]`).textContent = st.w[i]; });
    over.setAttribute('aria-pressed', st.over);
    const ranked = CARS.map((c, i) => ({ c, i, s: score(c, st.w), out: !!(c.over && !st.over) }))
      .sort((a, b) => (a.out - b.out) || (b.s - a.s));
    const h = Math.max(...rows.map(r => r.offsetHeight)) + 8;
    board.style.height = `${h * CARS.length}px`;
    ranked.forEach((r, k) => {
      const el = rows[r.i];
      el.style.transform = `translateY(${k * h}px)`;
      el.classList.toggle('first', k === 0);
      el.classList.toggle('out', r.out);
      el.querySelector('.no').textContent = r.out ? '—' : k + 1;
      el.querySelector('.pts').textContent = r.out ? '超预算' : r.s.toFixed(0);
      el.querySelector('.bar i').style.width = `${r.s}%`;
    });
    const top = ranked[0];
    out.innerHTML = `按现在的权重，排第一的是 <b class="ok">${top.c.name}</b>（${top.s.toFixed(0)} 分）。` + (st.over ? '' : '零跑T03 超出 5 万，先不排；点“5 万以上也排”放进来。');
  }
  ins.forEach((inp, i) => inp.addEventListener('input', () => { st.w[i] = +inp.value; draw(); }));
  over.addEventListener('click', () => { st.over = !st.over; draw(); });
  fig.api = { set(o = {}) { if (o.w) st.w = o.w.slice(); if (o.over != null) st.over = o.over; draw(); flash(fig); } };
  let lw = 0;
  // 改高度放到下一帧，避免在 ResizeObserver 回调里又触发一次布局
  new ResizeObserver(() => requestAnimationFrame(() => { if (board.clientWidth !== lw) { lw = board.clientWidth; draw(); } })).observe(board);
}
