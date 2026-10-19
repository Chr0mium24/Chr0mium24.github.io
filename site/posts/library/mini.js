// 首页小图：五间房的时间轴，拖红线看那一刻空几间。
import { palette, canvas2d, drag, onResize, clamp } from '/assets/fig.js';
import { fakeResponse, parse, toH } from './data.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  const rooms = Object.values(parse(fakeResponse('newlib_quietroom'))).map(list => list.map(r => [toH(r.startTime), toH(r.endTime)]));
  let t = 14.5, g;
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv), L = 12, R = 12, top = 12, rowH = (h - top - 34) / rooms.length;
    const X = hh => L + (hh - 8) / 14 * (w - L - R);
    g = { X, L, R };
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    let free = 0;
    rooms.forEach((busy, i) => {
      const y = top + i * rowH + 3, bh = rowH - 6;
      ctx.fillStyle = P.grid; ctx.fillRect(X(8), y, X(22) - X(8), bh);
      busy.forEach(([a, b]) => { ctx.fillStyle = P.mute; ctx.globalAlpha = .55; ctx.fillRect(X(a) + 1, y, X(b) - X(a) - 2, bh); ctx.globalAlpha = 1; });
      if (!busy.some(([a, b]) => t >= a && t < b)) { free++; ctx.fillStyle = P.ok; ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(X(t), y + bh / 2, 3, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    });
    ctx.strokeStyle = P.hand; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(t), top - 4); ctx.lineTo(X(t), h - 30); ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = P.hand; ctx.beginPath(); ctx.arc(X(t), top - 4, 5, 0, 7); ctx.fill();
    const hh = `${String(Math.floor(t)).padStart(2, '0')}:${t % 1 ? '30' : '00'}`;
    tag.textContent = `${hh} 空着 ${free} 间`;
  }
  drag(cv, { hit: () => 1, move: (_, x) => { t = clamp(Math.round(((x - g.L) / (cv.clientWidth - g.L - g.R) * 14 + 8) * 2) / 2, 8, 21.5); draw(); } });
  onResize(cv, draw);
}
