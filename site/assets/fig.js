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
