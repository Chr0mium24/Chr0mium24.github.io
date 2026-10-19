// 速查图：2025–26 校历时间线。拖红线（或改日期、点 ±1 天）选一天，看这天在干什么、离下一个节点还有几天。
import { palette, canvas2d, drag, onResize, clamp, flash } from '/assets/fig.js';

const D = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
const S = n => new Date(n * 864e5).toISOString().slice(0, 10);
const WD = '日一二三四五六';
const fmt = n => { const t = new Date(n * 864e5); return `${t.getUTCMonth() + 1}月${t.getUTCDate()}日（周${WD[t.getUTCDay()]}）`; };

// lane：0 学期授课，1 考试，2 假期 / 补课，3 加退选
export const EV = [
  { a: '2025-08-31', b: '2025-09-12', t: '第一学期加选/退选', lane: 3 },
  { a: '2025-09-01', b: '2025-12-12', t: '第一学期授课', lane: 0, start: '第一学期开始', end: '第一学期最后授课日' },
  { a: '2025-09-28', t: '补课：周三的课程', lane: 2 },
  { a: '2025-10-01', b: '2025-10-08', t: '公共假期：国庆节、中秋节', lane: 2 },
  { a: '2025-12-14', b: '2025-12-21', t: '第一学期科目考试', lane: 1 },
  { a: '2026-01-03', b: '2026-01-16', t: '第二学期加选/退选', lane: 3 },
  { a: '2026-01-05', b: '2026-05-08', t: '第二学期授课', lane: 0, start: '第二学期开始', end: '第二学期最后授课日' },
  { a: '2026-02-09', b: '2026-03-01', t: '农历新年假期', lane: 2 },
  { a: '2026-04-05', t: '清明节', lane: 2 },
  { a: '2026-05-01', t: '劳动节', lane: 2 },
  { a: '2026-05-09', b: '2026-05-16', t: '第二学期科目考试', lane: 1 },
  { a: '2026-05-30', b: '2026-06-05', t: '暑期课程加选/退选', lane: 3 },
  { a: '2026-06-01', b: '2026-07-17', t: '暑期课程授课', lane: 0, start: '暑期课程开始', end: '暑期课程最后授课日' },
  { a: '2026-06-19', t: '端午节', lane: 2 },
  { a: '2026-07-20', b: '2026-07-22', t: '暑期课程科目考试', lane: 1 },
].map(e => ({ ...e, A: D(e.a), B: D(e.b || e.a) }));
// 节点：每件事开始的那天；授课段的结束日（最后授课日）也算
const NODES = EV.flatMap(e => [{ d: e.A, t: e.start || e.t + (e.b ? '开始' : '') }, ...(e.end ? [{ d: e.B, t: e.end }] : [])]).sort((x, y) => x.d - y.d);
const LANES = ['授课', '考试', '假期', '加退选'];
const T0 = D('2025-08-25'), T1 = D('2026-07-28');

export default function (fig) {
  const cv = fig.querySelector('canvas'), out = fig.querySelector('.readout'), di = fig.querySelector('input[type=date]');
  const now0 = new Date(), today = Date.UTC(now0.getFullYear(), now0.getMonth(), now0.getDate()) / 864e5, inRange = today >= T0 && today <= T1;
  const st = { day: inRange ? today : D('2025-09-15') };
  let g = null;
  di.min = S(T0); di.max = S(T1);

  function draw() {
    const P = palette(fig), { ctx, w, h } = canvas2d(cv, 150), x0 = 44, x1 = w - 10, X = d => x0 + (d - T0) / (T1 - T0) * (x1 - x0), ly = i => 14 + i * 22;
    g = { X, x0, x1 };
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    ctx.font = P.font;
    // 月份
    for (let y = 2025, m = 9; y < 2027; m++) {
      if (m > 12) { m = 1; y++; }
      const d = D(`${y}-${String(m).padStart(2, '0')}-01`); if (d > T1) break;
      ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(X(d), 6); ctx.lineTo(X(d), h - 22); ctx.stroke();
      if (w > 380 || m % 2 === 1) { ctx.fillStyle = m === 1 ? P.ink : P.mute; ctx.textAlign = 'left'; ctx.fillText(`${m}月`, X(d) + 2, h - 8); }
    }
    LANES.forEach((s, i) => { ctx.fillStyle = P.mute; ctx.textAlign = 'right'; ctx.fillText(s, x0 - 6, ly(i) + 9); });
    const col = [P.ref, P.ink, P.ok, P.mute];
    EV.forEach(e => {
      const on = st.day >= e.A && st.day <= e.B, y = ly(e.lane);
      ctx.fillStyle = col[e.lane]; ctx.globalAlpha = on ? 1 : e.lane === 0 ? .45 : .7;
      if (e.B > e.A) { const a = X(e.A), b = Math.max(X(e.B + 1), a + 3); ctx.fillRect(a, y + 2, b - a, 9); }
      else { ctx.beginPath(); ctx.arc(X(e.A + .5), y + 6.5, 3.5, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
    });
    // 选中的那天
    const x = X(st.day + .5);
    ctx.strokeStyle = P.hand; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 4); ctx.lineTo(x, h - 24); ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = P.hand; ctx.beginPath(); ctx.arc(x, h - 24, 5.5, 0, 7); ctx.fill();

    di.value = S(st.day);
    const now = EV.filter(e => st.day >= e.A && st.day <= e.B);
    const next = NODES.filter(n => n.d > st.day), n0 = next[0];
    const soon = n0 ? next.filter(n => n.d === n0.d) : [];
    out.innerHTML = `<b>${fmt(st.day)}</b>　${now.length ? now.map(e => `<b class="ok">${e.t}</b>${e.B > e.A ? `（第 ${st.day - e.A + 1} / ${e.B - e.A + 1} 天）` : ''}`).join('、') : '没有安排'}。<br>` +
      (n0 ? `下一个节点：<b>${soon.map(n => n.t).join('、')}</b>，${fmt(n0.d)}，还有 <b class="ok">${n0.d - st.day}</b> 天。` : '这份校历已经走完了。') +
      (next[1] ? `<br>再往后：${next.filter(n => n.d > n0.d).slice(0, 2).map(n => `${n.t}（${n.d - st.day} 天）`).join('，')}。` : '') +
      (!inRange ? `<br><span style="color:var(--mute)">（今天 ${S(today)} 不在这份校历里。）</span>` : '');
  }

  drag(cv, { hit: (x, y) => g && x > g.x0 - 8 && x < g.x1 + 8 ? 1 : null, move: (_, x) => { st.day = clamp(Math.round(T0 + (x - g.x0) / (g.x1 - g.x0) * (T1 - T0) - .5), T0, T1); draw(); } });
  di.addEventListener('change', () => { if (di.value) { st.day = clamp(D(di.value), T0, T1); draw(); } });
  fig.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => { st.day = clamp(st.day + +b.dataset.step, T0, T1); draw(); }));
  fig.api = { set(o = {}) { if (o.day) st.day = clamp(D(o.day), T0, T1); draw(); flash(fig); } };
  onResize(cv, draw);
}
