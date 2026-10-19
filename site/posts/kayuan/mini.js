// 首页小图：23 条帖子排成一行，拖红色把手改 first，看一页切多大、翻完要请求几次。
import { palette, canvas2d, drag, onResize, clamp } from '/assets/fig.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  const N = 23;
  let first = 10, g;
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv), L = 14, R = 14, cw = (w - L - R) / N, y = h * .36, ch = Math.min(34, h * .26);
    g = { L, cw };
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    for (let k = 0; k < N; k++) {
      const page = Math.floor(k / first);
      ctx.fillStyle = page % 2 ? P.ref : P.ok; ctx.globalAlpha = .22 + (page % 2 ? 0 : .06);
      ctx.fillRect(L + k * cw + 1, y, cw - 2, ch); ctx.globalAlpha = 1;
      if (k % first === 0) { ctx.fillStyle = P.mute; ctx.font = '10px -apple-system, sans-serif'; ctx.textAlign = 'left'; ctx.fillText(`第${page + 1}页`, L + k * cw + 2, y - 8); }
    }
    // 红色把手：第一页的右边界
    const hx = L + first * cw;
    ctx.strokeStyle = P.hand; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx, y - 4); ctx.lineTo(hx, y + ch + 10); ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = P.hand; ctx.beginPath(); ctx.arc(hx, y + ch + 14, 7, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '600 9px -apple-system, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('↔', hx, y + ch + 14.5);
    tag.textContent = `first: ${first} → 翻完 ${N} 条要请求 ${Math.ceil(N / first)} 次`;
  }
  drag(cv, { hit: () => 1, move: (_, x) => { first = clamp(Math.round((x - g.L) / g.cw), 1, N); draw(); } });
  onResize(cv, draw);
}
