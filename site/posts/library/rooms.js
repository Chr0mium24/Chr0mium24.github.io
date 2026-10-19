// 图 1：一天的空房时间轴。拖红色竖线（或点轴上任意处），看那一刻哪些房空着、空到几点。
import { palette, canvas2d, drag, onResize, clamp, flash, seg } from '/assets/fig.js';
import { KINDS, fakeResponse, parse, toH } from './data.js';

const H0 = 8, H1 = 22;
const fmtH = h => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round(h % 1 * 60)).padStart(2, '0')}`;

export default function mount(fig) {
  const cv = fig.querySelector('canvas.rooms'), out = fig.querySelector('.readout'), raw = fig.querySelector('.raw');
  const st = { kind: 'newlib_quietroom', t: 14.5 };
  let rooms, g;
  const setKind = seg(fig.querySelector('.seg'), v => { st.kind = v; load(); });

  function load() {
    const resp = fakeResponse(st.kind), parsed = parse(resp);
    rooms = Object.entries(parsed).map(([sn, list]) => ({ sn, busy: list.map(r => [toH(r.startTime), toH(r.endTime)]) }));
    raw.textContent = JSON.stringify(parsed, null, 1).replace(/\n\s+(?="[se])/g, ' ').replace(/\n\s+}/g, ' }');
    draw();
  }

  function draw() {
    const P = palette(fig), rowH = 30, top = 26, left = 54, right = 14;
    const { ctx, w, h } = canvas2d(cv, top + rooms.length * rowH + 22);
    const X = hh => left + (hh - H0) / (H1 - H0) * (w - left - right);
    g = { X, left, right, w, top, h };
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    ctx.font = P.font; ctx.textBaseline = 'middle';
    for (let hh = H0; hh <= H1; hh += 2) {
      ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(X(hh), top - 6); ctx.lineTo(X(hh), h - 18); ctx.stroke();
      ctx.fillStyle = P.mute; ctx.textAlign = 'center'; ctx.fillText(`${hh}:00`, X(hh), h - 8);
    }
    const free = [];
    rooms.forEach((r, i) => {
      const y = top + i * rowH + 4, bh = rowH - 10;
      ctx.fillStyle = P.ink; ctx.textAlign = 'right'; ctx.fillText(r.sn, left - 10, y + bh / 2);
      ctx.fillStyle = P.grid; ctx.fillRect(X(H0), y, X(H1) - X(H0), bh);
      r.busy.forEach(([a, b]) => { ctx.fillStyle = P.mute; ctx.globalAlpha = .55; ctx.fillRect(X(a) + 1, y, X(b) - X(a) - 2, bh); ctx.globalAlpha = 1; });
      const now = r.busy.find(([a, b]) => st.t >= a && st.t < b);
      if (!now) {
        const next = r.busy.filter(([a]) => a > st.t).map(([a]) => a).sort((a, b) => a - b)[0] ?? H1;
        const prev = r.busy.filter(([, b]) => b <= st.t).map(([, b]) => b).sort((a, b) => b - a)[0] ?? H0;
        ctx.fillStyle = P.ok; ctx.globalAlpha = .28; ctx.fillRect(X(prev), y, X(next) - X(prev), bh); ctx.globalAlpha = 1;
        free.push({ sn: r.sn, until: next });
      }
    });
    // 红色时间线 + 顶上的把手
    const x = X(st.t);
    ctx.strokeStyle = P.hand; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, top - 4); ctx.lineTo(x, h - 18); ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = P.hand; ctx.beginPath(); ctx.roundRect(x - 22, 2, 44, 18, 9); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(fmtH(st.t), x, 11);
    out.innerHTML = free.length
      ? `${fmtH(st.t)} 空着 <b class="ok">${free.length} 间</b>：${free.sort((a, b) => b.until - a.until).map(f => `${f.sn}（到 ${fmtH(f.until)}）`).join('、')}。`
      : `${fmtH(st.t)} <b class="bad">全满</b>，往后拖找下一个空档。`;
  }

  drag(cv, { hit: (x, y) => y < g.h - 14 && x > g.left - 4 ? 1 : null, move: (_, x) => { st.t = clamp(Math.round(((x - g.left) / (g.w - g.left - g.right) * (H1 - H0) + H0) * 4) / 4, H0, H1 - .25); draw(); } });
  fig.api = { set(o = {}) { if (o.kind) { st.kind = o.kind; setKind(o.kind); } if (o.t != null) st.t = o.t; load(); flash(fig); } };
  setKind(st.kind);
  load();
  onResize(cv, draw);
}
