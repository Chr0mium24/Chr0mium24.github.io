// 图 1：三遍读法。同一篇三页的论文，每一遍读哪些块（绿）、之前读过的（蓝）、还没读的（灰）。
// 点页面上的块看这一遍对它做什么；“下一块”按这一遍的顺序走。下面是三遍各花多久（对数刻度）。
import { palette, canvas2d, onResize, seg, flash } from '/assets/fig.js';
import { PASSES, KINDS, drawPages } from './paper.js';

export default function mount(fig) {
  const cv = fig.querySelector('canvas.pages'), tc = fig.querySelector('canvas.time'), out = fig.querySelector('.readout');
  const st = { pass: 0, sel: null, step: -1 };
  let L = null;
  const setSeg = seg(fig.querySelector('.seg.pass'), v => { st.pass = +v; st.sel = null; st.step = -1; draw(); });

  function draw() {
    const P = palette(fig), w = cv.clientWidth, gap = Math.max(6, w * .025), pw = (w - 4 - gap * 2) / 3;
    const { ctx, h } = canvas2d(cv, Math.round(pw * 1.32 + 6));
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    L = drawPages(ctx, P, { x: 2, y: 3, w: w - 4, h: 9999 }, st.pass, st.sel, gap);
    drawTime(P);
    setSeg(String(st.pass));
    const ps = PASSES[st.pass];
    const seq = ps.order.map(k => k === st.sel ? `<b>${KINDS[k]}</b>` : KINDS[k]).join(' → ');
    out.innerHTML = (st.sel ? `<b>${KINDS[st.sel]}</b>：${ps.note[st.sel]}<br><br>` : '') +
      `<b class="ok">${ps.name} · ${ps.time}</b>　${ps.goal}。<br>顺序：${seq}。<br>读完：${ps.out}`;
  }

  function drawTime(P) {
    const { ctx, w, h } = canvas2d(tc, 82), x0 = 44, x1 = w - 12, lo = Math.log(3), hi = Math.log(360);
    const X = m => x0 + (Math.log(m) - lo) / (hi - lo) * (x1 - x0);
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    ctx.font = P.font; ctx.textAlign = 'center';
    [[5, '5 分'], [10, '10 分'], [30, '30 分'], [60, '1 时'], [120, '2 时'], [300, '5 时']].forEach(([m, s]) => {
      ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(X(m), 4); ctx.lineTo(X(m), h - 18); ctx.stroke();
      if (w < 360 && (m === 10 || m === 120)) return;
      ctx.fillStyle = P.mute; ctx.fillText(s, X(m), h - 4);
    });
    PASSES.forEach((p, i) => {
      const y = 10 + i * 19, on = i === st.pass;
      ctx.textAlign = 'right'; ctx.fillStyle = on ? P.ink : P.mute; ctx.fillText(p.name, x0 - 6, y + 9);
      ctx.fillStyle = on ? P.ok : P.mute; ctx.globalAlpha = on ? .9 : .35;
      const a = X(p.t[0]), b = Math.max(X(p.t[1]), a + 6);
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(a, y, b - a, 11, 5) : ctx.rect(a, y, b - a, 11); ctx.fill(); ctx.globalAlpha = 1;
      ctx.textAlign = b + 70 < x1 ? 'left' : 'right'; ctx.fillStyle = on ? P.ink : P.mute;
      ctx.fillText(p.time, b + 70 < x1 ? b + 6 : a - 6, y + 9);
    });
  }

  const pos = e => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  const hit = (x, y) => L?.rects.find(r => x > r.x - 4 && x < r.x + r.w + 4 && y > r.y - 4 && y < r.y + r.h + 4);
  cv.addEventListener('pointermove', e => { cv.style.cursor = hit(...pos(e)) ? 'pointer' : 'default'; });
  cv.addEventListener('click', e => {
    const r = hit(...pos(e));
    st.sel = r ? (st.sel === r.k ? null : r.k) : null;
    st.step = st.sel ? PASSES[st.pass].order.indexOf(st.sel) : -1;
    draw();
  });
  fig.querySelector('.next').addEventListener('click', () => {
    const o = PASSES[st.pass].order;
    st.step = (st.step + 1) % o.length; st.sel = o[st.step]; draw();
  });

  fig.api = {
    set(o = {}) {
      if (o.pass != null) { st.pass = o.pass; st.sel = null; st.step = -1; }
      if ('sel' in o) { st.sel = o.sel; st.step = PASSES[st.pass].order.indexOf(o.sel); }
      draw(); flash(fig);
    },
  };
  onResize(cv, draw);
}

