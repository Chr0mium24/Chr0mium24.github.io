// 首页小图：拖红点改控制电压 v_c，看压控电压源输出 v_o = 5·v_c 跟着走。
import { palette, canvas2d, drag, onResize, clamp } from '/assets/fig.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  let vc = .4, g;
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv), K = 5;
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    // 左：v_c 的刻度条（-1 … 1 V）
    const x0 = 22, x1 = w * .42, ty = h * .48, X = v => x0 + (v + 1) / 2 * (x1 - x0);
    g = { X, x0, x1, ty };
    ctx.strokeStyle = P.mute; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, ty); ctx.lineTo(x1, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(X(0), ty - 5); ctx.lineTo(X(0), ty + 5); ctx.stroke();
    ctx.fillStyle = P.hand; ctx.globalAlpha = .18; ctx.beginPath(); ctx.arc(X(vc), ty, 12, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(X(vc), ty, 6, 0, 7); ctx.fill();
    ctx.font = '600 12px -apple-system, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('v_c', (x0 + x1) / 2, ty - 22);
    // 中：菱形的受控源
    const dx = w * .58, dy = ty;
    ctx.strokeStyle = P.ref; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x1 + 8, ty); ctx.lineTo(dx - 22, dy); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = P.ink; ctx.fillStyle = P.bg; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(dx, dy - 20); ctx.lineTo(dx + 16, dy); ctx.lineTo(dx, dy + 20); ctx.lineTo(dx - 16, dy); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = P.ink; ctx.fillText('×5', dx, dy + .5);
    // 右：输出电压的柱子（-5 … 5 V）
    const bx = w * .8, bw = 26, mid = ty, span = h * .36, vo = K * vc;
    ctx.strokeStyle = P.mute; ctx.lineWidth = 1; ctx.strokeRect(bx - bw / 2, mid - span, bw, span * 2);
    ctx.beginPath(); ctx.moveTo(bx - bw / 2 - 4, mid); ctx.lineTo(bx + bw / 2 + 4, mid); ctx.stroke();
    ctx.fillStyle = P.ok; ctx.globalAlpha = .85; ctx.fillRect(bx - bw / 2 + 3, vo >= 0 ? mid - vo / 5 * span : mid, bw - 6, Math.abs(vo) / 5 * span); ctx.globalAlpha = 1;
    ctx.fillStyle = P.ok; ctx.fillText('v_o', bx, mid - span - 10);
    tag.textContent = `v_o = 5 × ${vc.toFixed(2)} V = ${(K * vc).toFixed(2)} V`;
  }
  drag(cv, { hit: (x, y) => Math.abs(y - g.ty) < 22 && x > g.x0 - 14 && x < g.x1 + 14 ? 1 : null, move: (_, x) => { vc = clamp(Math.round(((x - g.x0) / (g.x1 - g.x0) * 2 - 1) * 20) / 20, -1, 1); draw(); } });
  onResize(cv, draw);
}
