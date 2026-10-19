// 首页小图：点红色开关切 deps=True / False，看 lcapy 装不装得上。
import { palette, canvas2d, onResize } from '/assets/fig.js';

const DEPS = ['sympy', 'numpy', 'networkx', 'importlib', 'scipy', 'matplotlib'];

export default function (el) {
  const cv = el.appendChild(document.createElement('canvas'));
  const tag = el.appendChild(Object.assign(document.createElement('span'), { className: 'tag' }));
  let deps = true, sw = null;
  function draw() {
    const P = palette(el), { ctx, w, h } = canvas2d(cv);
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    // 红色开关
    const sx = 14, sy = 12, swW = 108, swH = 26;
    sw = { x: sx, y: sy, w: swW, h: swH };
    ctx.fillStyle = P.hand; ctx.strokeStyle = P.hand; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(sx, sy, swW, swH, 13); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '600 12px SF Mono, Menlo, monospace'; ctx.fillText(`deps=${deps ? 'True' : 'False'}`, sx + swW / 2, sy + swH / 2 + .5);
    // lcapy 在左，依赖在右边排成一列，连线呈扇形
    const lx = w * .22, ly = h * .5, gx = w * .72, y0 = h * .11, dy = (h * .6) / (DEPS.length - 1);
    DEPS.forEach((d, i) => {
      const x = gx, y = y0 + i * dy, bad = d === 'importlib';
      const on = !deps && !bad;
      ctx.font = '11px SF Mono, Menlo, monospace';
      const bw = ctx.measureText(d).width + 12;
      ctx.strokeStyle = deps ? (bad ? P.ink : P.mute) : P.grid; ctx.lineWidth = 1; ctx.setLineDash(deps ? [] : [3, 3]);
      ctx.beginPath(); ctx.moveTo(lx + 32, ly); ctx.bezierCurveTo(lx + 70, ly, x - bw / 2 - 40, y, x - bw / 2 - 3, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = on ? P.ok : P.bg; ctx.globalAlpha = on ? .16 : 1; ctx.beginPath(); ctx.roundRect(x - bw / 2, y - 9, bw, 18, 4); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = on ? P.ok : bad && deps ? P.ink : P.mute; ctx.stroke();
      ctx.fillStyle = on ? P.ok : bad && deps ? P.ink : P.mute; ctx.fillText(d, x, y + .5);
      if (bad && deps) { ctx.strokeStyle = P.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - bw / 2 - 2, y); ctx.lineTo(x + bw / 2 + 2, y); ctx.stroke(); }
    });
    ctx.font = '600 13px SF Mono, Menlo, monospace';
    ctx.fillStyle = deps ? P.bg : P.ok; ctx.globalAlpha = deps ? 1 : .16; ctx.beginPath(); ctx.roundRect(lx - 32, ly - 13, 64, 26, 6); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = deps ? P.ink : P.ok; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = deps ? P.ink : P.ok; ctx.fillText('lcapy', lx, ly + .5);
    tag.textContent = deps ? "ValueError：找不到 importlib 的纯 Python wheel" : 'deps=False + 自己 loadPackage：装上了';
  }
  const inSw = e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; return sw && x > sw.x - 6 && x < sw.x + sw.w + 6 && y > sw.y - 6 && y < sw.y + sw.h + 6; };
  cv.addEventListener('pointerdown', e => { if (inSw(e)) { deps = !deps; draw(); } });
  cv.addEventListener('pointermove', e => { cv.style.cursor = inSw(e) ? 'pointer' : 'default'; });
  onResize(cv, draw);
}
