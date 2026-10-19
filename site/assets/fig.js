// 画图用的小工具：所有图和首页小图都从这里拿。

export const css = (el, n) => getComputedStyle(el).getPropertyValue(n).trim();
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// 图的颜色全从 CSS 变量读：换样式表就换皮
export function palette(el) {
  const c = n => css(el, n);
  return { bg: c('--fig-bg'), ink: c('--fig-ink'), mute: c('--fig-mute'), grid: c('--fig-grid'), ok: c('--fig-ok'), ref: c('--fig-ref'), hand: c('--fig-hand'), font: c('--fig-font') || '12px sans-serif' };
}

// 高清 canvas：按 CSS 宽度和给定高度设好像素；h 不给就用元素自身高度
export function canvas2d(cv, h) {
  const dpr = Math.min(devicePixelRatio || 1, 2), w = cv.clientWidth, H = h ?? cv.clientHeight;
  if (h != null) cv.style.height = h + 'px';
  cv.width = Math.max(1, w * dpr); cv.height = Math.max(1, H * dpr);
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h: H };
}

// 拖拽：hit(x, y) 返回被抓住的东西（或 null），move(target, x, y) 跟着动；hover 时给 grab 光标
export function drag(cv, { hit, move, start, end, hover }) {
  let cur = null;
  const pos = e => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  cv.addEventListener('pointerdown', e => {
    const [x, y] = pos(e), t = hit(x, y); if (t == null) return;
    cur = t; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; start?.(t, x, y); move?.(t, x, y);
  });
  cv.addEventListener('pointermove', e => {
    const [x, y] = pos(e);
    if (cur != null) { move?.(cur, x, y); return; }
    const t = hit(x, y); cv.style.cursor = t != null ? 'grab' : 'default'; hover?.(t, x, y);
  });
  const stop = () => { if (cur == null) return; const t = cur; cur = null; cv.style.cursor = 'grab'; end?.(t); };
  cv.addEventListener('pointerup', stop); cv.addEventListener('pointercancel', stop);
  cv.addEventListener('pointerleave', () => { if (cur == null) hover?.(null); });
}

// 尺寸变了就重画；宽度还是 0（没排版或藏着）就先不画
export function onResize(el, fn) {
  const run = () => { if (el.clientWidth > 40) fn(); };
  new ResizeObserver(run).observe(el); run();
}

// 分段按钮：<div class="seg"><button value="a">…；返回 set(value)
export function seg(root, onPick) {
  const bs = [...root.querySelectorAll('button')];
  const set = v => bs.forEach(b => b.setAttribute('aria-pressed', b.value === v));
  bs.forEach(b => b.addEventListener('click', () => { set(b.value); onPick(b.value); }));
  return set;
}

// 图被正文里的按钮改了状态时闪一下，提醒“这里变了”
export function flash(fig) { fig.classList.remove('flash'); void fig.offsetWidth; fig.classList.add('flash'); }

export const fmt = (v, d = 2) => (+v.toFixed(d)).toString();

// 平滑过渡：from/to 是数字、数组或数字组成的对象；reduced-motion 时直接跳到终点
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const lerp = (a, b, t) => typeof a === 'number' ? a + (b - a) * t
  : Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], t))
  : Object.fromEntries(Object.keys(a).map(k => [k, lerp(a[k], b[k], t)]));
export const ease = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
export function tween(from, to, ms, onUpdate) {
  if (reduce() || !ms) { onUpdate(to, 1); return Promise.resolve(); }
  return new Promise(res => {
    const t0 = performance.now();
    const step = now => {
      const t = Math.min(1, (now - t0) / ms);
      onUpdate(t === 1 ? to : lerp(from, to, ease(t)), t);
      t < 1 ? requestAnimationFrame(step) : res();
    };
    requestAnimationFrame(step);
  });
}

// 折线图：在 ctx 的 box = {x, y, w, h} 里画坐标、网格和几条线
// opt = { P, xr: [x0, x1], yr: [y0, y1], series: [{ pts: [[x, y]…], color, width, dash, fill }], xticks, yticks, xlabel, ylabel }
export function plot(ctx, box, opt) {
  const { P, xr, yr, series = [], xticks = [], yticks = [] } = opt;
  const X = x => box.x + (x - xr[0]) / (xr[1] - xr[0]) * box.w;
  const Y = y => box.y + box.h - (y - yr[0]) / (yr[1] - yr[0]) * box.h;
  ctx.save();
  ctx.font = P.font; ctx.fillStyle = P.mute; ctx.strokeStyle = P.grid; ctx.lineWidth = 1;
  xticks.forEach(t => { ctx.beginPath(); ctx.moveTo(X(t), box.y); ctx.lineTo(X(t), box.y + box.h); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(+t.toFixed(3), X(t), box.y + box.h + 14); });
  yticks.forEach(t => { ctx.beginPath(); ctx.moveTo(box.x, Y(t)); ctx.lineTo(box.x + box.w, Y(t)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(+t.toFixed(3), box.x - 5, Y(t) + 4); });
  ctx.strokeStyle = P.mute; ctx.beginPath(); ctx.moveTo(box.x, box.y); ctx.lineTo(box.x, box.y + box.h); ctx.lineTo(box.x + box.w, box.y + box.h); ctx.stroke();
  if (opt.xlabel) { ctx.textAlign = 'right'; ctx.fillText(opt.xlabel, box.x + box.w, box.y + box.h - 5); }
  if (opt.ylabel) { ctx.textAlign = 'left'; ctx.fillText(opt.ylabel, box.x + 5, box.y + 11); }
  ctx.beginPath(); ctx.rect(box.x, box.y - 2, box.w, box.h + 4); ctx.clip();
  series.forEach(s => {
    if (!s.pts.length) return;
    ctx.beginPath(); s.pts.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)));
    if (s.fill) { ctx.lineTo(X(s.pts.at(-1)[0]), Y(yr[0])); ctx.lineTo(X(s.pts[0][0]), Y(yr[0])); ctx.closePath(); ctx.fillStyle = s.fill; ctx.fill(); return; }
    ctx.strokeStyle = s.color || P.ink; ctx.lineWidth = s.width || 1.6; ctx.setLineDash(s.dash || []); ctx.stroke(); ctx.setLineDash([]);
  });
  ctx.restore();
  return { X, Y };
}
