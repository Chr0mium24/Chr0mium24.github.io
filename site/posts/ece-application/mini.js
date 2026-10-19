// 首页小图：点地区，看建议投几个项目。
import { palette, canvas2d, onResize } from '/assets/fig.js';
import { REGIONS, advise } from './regions.js';

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  let sel = ['英国', '香港', '新加坡'], hits = [];
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv), A = advise(sel);
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    // 地区按两行排成小圆钮
    const cols = 4, cw = w / cols, r = Math.min(cw * .36, h * .15);
    hits = REGIONS.map((name, i) => {
      const row = i < 4 ? 0 : 1, col = row ? i - 4 + .5 : i, x = cw * (col + .5), y = h * (row ? .5 : .22);
      const on = sel.includes(name);
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
      ctx.fillStyle = on ? P.hand : P.bg; ctx.fill(); ctx.strokeStyle = P.hand; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = on ? '#fff' : P.hand; ctx.font = P.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(name, x, y);
      return { name, x, y, r };
    });
    ctx.textBaseline = 'alphabetic';
    // 数轴 0–14
    const x0 = w * .08, x1 = w * .92, X = v => x0 + v / 14 * (x1 - x0), y = h * .76;
    ctx.strokeStyle = P.mute; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    for (let v = 0; v <= 14; v += 2) { ctx.beginPath(); ctx.moveTo(X(v), y - 3); ctx.lineTo(X(v), y + 3); ctx.stroke(); }
    if (A.band) { ctx.fillStyle = P.ok; ctx.globalAlpha = .3; ctx.fillRect(X(A.band[0]), y - 7, X(A.band[1]) - X(A.band[0]), 14); ctx.globalAlpha = 1; ctx.strokeStyle = P.ok; ctx.strokeRect(X(A.band[0]), y - 7, X(A.band[1]) - X(A.band[0]), 14); }
    tag.textContent = A.band ? `${sel.length} 个地区 → 投 ${A.band[0]}–${A.band[1]} 个项目` : sel.length ? '这个组合规则没覆盖' : '点几个地区';
  }
  cv.addEventListener('click', e => {
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    const t = hits.find(q => Math.hypot(q.x - x, q.y - y) < q.r + 4); if (!t) return;
    sel = sel.includes(t.name) ? sel.filter(n => n !== t.name) : [...sel, t.name]; draw();
  });
  cv.addEventListener('pointermove', e => { const b = cv.getBoundingClientRect(); cv.style.cursor = hits.some(q => Math.hypot(q.x - (e.clientX - b.left), q.y - (e.clientY - b.top)) < q.r + 4) ? 'pointer' : 'default'; });
  onResize(cv, draw);
}
