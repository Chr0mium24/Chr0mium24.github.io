// 图：正方形的 8 个对称（二面体群 D4）。点红色的“转”“翻”，正方形真的转、真的翻；点乘法表的格子直接跳到那个元素。
// 记法：r = 逆时针转 90°，s = 沿竖直轴翻。元素写成 rᵏ 或 rᵏs，意思是“先 s（如果有），再转 k 次”。
import { palette, canvas2d, onResize, flash } from '/assets/fig.js';

export const EL = [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1]];   // (k, f)
export const name = ([k, f]) => (k === 0 ? (f ? '' : 'e') : k === 1 ? 'r' : `r${'⁰¹²³'[k]}`) + (f ? 's' : '');
export const press = ([k, f], b) => b === 'r' ? [(k + 1) % 4, f] : [(4 - k) % 4, 1 - f];
// a∘b：先做 b 再做 a
export function compose([k1, f1], [k2, f2]) { return f1 ? [(k1 - k2 + 4) % 4, 1 - f2] : [(k1 + k2) % 4, f2]; }
export const matrix = ([k, f]) => { const c = [1, 0, -1, 0][k], s = [0, 1, 0, -1][k]; return f ? [-c, -s, -s, c] : [c, -s, s, c]; };   // [a b; c d] = Rᵏ·Sᶠ：先翻（x→−x）再转

export default function mount(fig) {
  const cv = fig.querySelector('canvas.square'), tbl = fig.querySelector('.cayley'), out = fig.querySelector('.readout'), hist = fig.querySelector('.hist');
  let el = [0, 0], M = matrix(el), anim = null, seq = [];

  function draw(Mshow = M) {
    const P = palette(fig), size = Math.min(cv.clientWidth, 360);
    const { ctx, w, h } = canvas2d(cv, size);
    const cx = w / 2, cy = h / 2, a = size * .26;
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    // 原来的位置：虚线
    ctx.setLineDash([4, 4]); ctx.strokeStyle = P.mute; ctx.strokeRect(cx - a, cy - a, 2 * a, 2 * a); ctx.setLineDash([]);
    ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(cx, cy - a * 1.6); ctx.lineTo(cx, cy + a * 1.6); ctx.stroke();
    ctx.fillStyle = P.mute; ctx.font = P.font; ctx.textAlign = 'center'; ctx.fillText('s 沿这条线翻', cx, cy - a * 1.6 - 6);
    const T = ([x, y]) => [cx + (Mshow[0] * x + Mshow[1] * y) * a, cy - (Mshow[2] * x + Mshow[3] * y) * a];
    const corners = [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(T);
    ctx.beginPath(); corners.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
    ctx.fillStyle = P.bg; ctx.fill(); ctx.strokeStyle = P.ink; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1;
    // 一面贴个旗子，看得出翻没翻
    const flag = [[-.55, .55], [.05, .55], [-.55, -.1]].map(T);
    ctx.beginPath(); flag.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
    ctx.fillStyle = P.ok; ctx.globalAlpha = .35; ctx.fill(); ctx.globalAlpha = 1;
    ctx.font = '600 15px -apple-system, sans-serif'; ctx.fillStyle = P.ink;
    [[-1.25, 1.25], [1.25, 1.25], [1.25, -1.25], [-1.25, -1.25]].map(T).forEach(([x, y], i) => ctx.fillText(i + 1, x, y + 5));
  }

  function set(next, how) {
    const from = M, to = matrix(next);
    el = next; render();
    if (!how) { M = to; draw(); return; }
    cancelAnimationFrame(anim);
    const t0 = performance.now(), D = 320;
    const step = now => {
      const t = Math.min(1, (now - t0) / D), e = t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      let A;
      if (how === 'r') { const c = Math.cos(e * Math.PI / 2), s = Math.sin(e * Math.PI / 2); A = [c, -s, s, c]; }
      else A = [Math.cos(e * Math.PI), 0, 0, 1];
      draw([A[0] * from[0] + A[1] * from[2], A[0] * from[1] + A[1] * from[3], A[2] * from[0] + A[3] * from[2], A[2] * from[1] + A[3] * from[3]]);
      if (t < 1) anim = requestAnimationFrame(step); else { M = to; draw(); }
    };
    anim = requestAnimationFrame(step);
  }

  function render() {
    const cur = name(el);
    tbl.innerHTML = `<thead><tr><th>∘</th>${EL.map(b => `<th class="${name(b) === cur ? 'cur' : ''}">${name(b)}</th>`).join('')}</tr></thead><tbody>${EL.map(a => `<tr><th class="${name(a) === cur ? 'cur' : ''}">${name(a)}</th>${EL.map(b => { const c = compose(a, b); return `<td data-a="${name(a)}" data-b="${name(b)}" class="${name(c) === cur ? 'hit' : ''}">${name(c)}</td>`; }).join('')}</tr>`).join('')}</tbody>`;
    hist.textContent = seq.length ? `按过：${seq.join(' ')}` : '还没按';
    out.innerHTML = `现在是 <b class="ok">${cur}</b>${el[1] ? '：先翻，再' + (el[0] ? `转 ${el[0] * 90}°` : '不转') : el[0] ? `：转了 ${el[0] * 90}°` : '：什么都没动'}。乘法表里所有等于 ${cur} 的格子都标出来了。`;
  }

  fig.querySelectorAll('[data-press]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.press;
    if (k === 'e') { seq = []; set([0, 0]); return; }
    seq.push(k); set(press(el, k), k);
  }));
  tbl.addEventListener('click', e => {
    const td = e.target.closest('td[data-a]'); if (!td) return;
    const a = EL.find(x => name(x) === td.dataset.a), b = EL.find(x => name(x) === td.dataset.b);
    seq = [`${td.dataset.a} ∘ ${td.dataset.b}`]; set(compose(a, b));
    out.innerHTML += `　<span style="color:var(--mute)">${td.dataset.a} ∘ ${td.dataset.b}：先 ${td.dataset.b}，再 ${td.dataset.a}。</span>`;
  });
  fig.api = {
    set({ seq: s } = {}) {
      seq = []; let x = [0, 0];
      for (const c of s || '') { seq.push(c); x = press(x, c); }
      set(x); flash(fig);
    },
  };
  render();
  onResize(cv, () => draw());
}
