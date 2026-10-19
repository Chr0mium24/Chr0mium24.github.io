// 首页小图：三个极点躺在实轴上，拖红色的 ×，看夹住单位圆的那段 ROC。
import { palette, canvas2d, drag, onResize, clamp, fmt } from '/assets/fig.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  const rs = [1 / 3, 2, 3], R = 3.3;
  let g;
  const show = r => Math.abs(r - 1 / 3) < .01 ? '1/3' : fmt(r);

  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv);
    const cx = w / 2, cy = h / 2, k = Math.min(w / 2 - 10, h / 2 - 6) / R * 1.25;
    g = { cx, cy, k };
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    const on = rs.some(r => r === 1);
    if (!on) {
      const lo = Math.max(0, ...rs.filter(r => r < 1)), hi = Math.min(99, ...rs.filter(r => r > 1));
      ctx.beginPath(); ctx.arc(cx, cy, Math.min(hi * k, w), 0, Math.PI * 2); if (lo) ctx.arc(cx, cy, lo * k, 0, Math.PI * 2, true);
      ctx.fillStyle = P.ok; ctx.globalAlpha = .2; ctx.fill('evenodd'); ctx.globalAlpha = 1;
      tag.textContent = `ROC：${lo ? show(lo) + ' < ' : ''}|z|${hi < 99 ? ' < ' + show(hi) : ' > ' + show(lo)}`;
    } else tag.textContent = '极点压在单位圆上：DTFT 不存在';
    ctx.setLineDash([3, 3]); ctx.strokeStyle = P.mute;
    rs.forEach(r => { ctx.beginPath(); ctx.arc(cx, cy, r * k, 0, Math.PI * 2); ctx.stroke(); });
    ctx.setLineDash([]); ctx.strokeStyle = P.ref; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, k, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 1;
    rs.forEach(r => {
      const x = cx + r * k;
      ctx.fillStyle = P.hand; ctx.globalAlpha = .15; ctx.beginPath(); ctx.arc(x, cy, 10, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = P.hand; ctx.lineWidth = 2.2; const d = 4.5;
      ctx.beginPath(); ctx.moveTo(x - d, cy - d); ctx.lineTo(x + d, cy + d); ctx.moveTo(x - d, cy + d); ctx.lineTo(x + d, cy - d); ctx.stroke(); ctx.lineWidth = 1;
    });
  }
  drag(cv, {
    hit: (x, y) => { const i = rs.findIndex(r => Math.hypot(g.cx + r * g.k - x, g.cy - y) < 14); return i < 0 ? null : i; },
    move: (i, x) => { let r = clamp((x - g.cx) / g.k, .08, 3.2); if (Math.abs(r - 1) < .06) r = 1; rs[i] = r; draw(); },
  });
  onResize(cv, draw);
}
