// 图：z 平面 + 半径线。拖极点（平面上拖位置，半径线上只拖半径），换“问的是”，看 ROC。
// 颜色、字体全部从 CSS 变量读，所以换样式表就换皮，代码不动。
// 用法：<figure data-fig="zplane"> 里放 canvas.plane、canvas.radius、.seg[data-k="q"]、.presets、.readout

const R = 3.4;          // 平面画到 |z| = 3.4
const SNAP = 0.04;      // 离单位圆这么近就吸上去

export default function mount(fig) {
  const plane = fig.querySelector('canvas.plane');
  const line = fig.querySelector('canvas.radius');
  const out = fig.querySelector('.readout');
  const st = { poles: polar([1 / 3, 2, 3]), q: 'dtft', active: 1, hover: -1 };

  // ---------- 小工具 ----------
  function polar(rs, angles) { return rs.map((r, i) => { const a = angles ? angles[i] : 0; return { x: r * Math.cos(a), y: r * Math.sin(a) }; }); }
  const rad = p => Math.hypot(p.x, p.y);
  const css = n => getComputedStyle(fig).getPropertyValue(n).trim();
  const fmt = r => r === Infinity ? '∞' : Math.abs(r - 1 / 3) < 0.005 ? '1/3' : (+r.toFixed(2)).toString();
  function setup(cv, h) {
    const dpr = Math.min(devicePixelRatio || 1, 2), w = cv.clientWidth;
    cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px';
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  // ---------- 规则：和笔记第 1、3 节一一对应 ----------
  function solve() {
    const rs = [...new Set(st.poles.map(p => +rad(p).toFixed(6)))].sort((a, b) => a - b);
    const onCircle = rs.some(r => Math.abs(r - 1) < 1e-6);
    const min = rs[0], max = rs[rs.length - 1];
    if (st.q === 'dtft') {
      if (onCircle) return { rs, rocs: [], dead: true };
      const lo = Math.max(0, ...rs.filter(r => r < 1)), hi = Math.min(Infinity, ...rs.filter(r => r > 1));
      return { rs, rocs: [[lo, hi]], lo, hi };
    }
    if (st.q === 'causal') return { rs, rocs: [[max, Infinity]], max, onCircle };
    if (st.q === 'left') return { rs, rocs: [[0, min]], min, onCircle };
    const segs = []; for (let i = 0; i < rs.length - 1; i++) segs.push([rs[i], rs[i + 1]]);
    return { rs, rocs: segs };
  }

  function say(s) {
    const roc = (lo, hi) => lo === 0 ? `|z| < ${fmt(hi)}` : hi === Infinity ? `|z| > ${fmt(lo)}` : `${fmt(lo)} < |z| < ${fmt(hi)}`;
    const ok = t => `<b class="ok">${t}</b>`, bad = t => `<b class="bad">${t}</b>`;
    if (st.q === 'dtft') {
      if (s.dead) return `有极点正好压在单位圆上（|z| = 1）→ 没有任何 ROC 能包含整条单位圆 → ${bad('DTFT 不存在、系统不稳定')}，不用再挑环带了。`;
      const why = s.lo === 0 ? '没有比 1 小的极点，下界取 0' : `比 1 小的最大半径是 ${fmt(s.lo)}`;
      const why2 = s.hi === Infinity ? '没有比 1 大的极点，上界取 ∞' : `比 1 大的最小半径是 ${fmt(s.hi)}`;
      const side = s.lo === 0 ? '圆内，左边序列' : s.hi === Infinity ? '圆外，右边序列' : '双边序列';
      return `${why}，${why2} → ROC：${ok(roc(s.lo, s.hi))}，夹住了单位圆，DTFT 存在（${side}）。`;
    }
    if (st.q === 'causal') return `因果看最外的极点（半径 ${fmt(s.max)}）→ ROC：${ok(roc(s.max, Infinity))}。` + (s.max < 1 ? `含单位圆，${ok('因果且稳定')}。` : `不含单位圆，${bad('因果但不稳定')}。`);
    if (st.q === 'left') return `左边序列看最内的极点（半径 ${fmt(s.min)}）→ ROC：${ok(roc(0, s.min))}。` + (s.min > 1 ? `含单位圆，稳定。` : `不含单位圆，${bad('不稳定')}。`);
    const n = s.rs.length;
    return n < 2 ? '只有一种半径，没有夹在两个极点之间的环带。' : `${n} 种半径切出 ${n + 1} 段，夹在相邻极点之间的有 ${n - 1} 段：${s.rocs.map((r, i) => `${i + 1}）${roc(...r)}`).join('　')}。`;
  }

  // ---------- 画 ----------
  let geo;
  function draw() {
    const C = { bg: css('--fig-bg'), ink: css('--fig-ink'), mute: css('--fig-mute'), grid: css('--fig-grid'), roc: css('--fig-ok'), unit: css('--fig-ref'), hand: css('--fig-hand'), font: css('--fig-font') || '12px sans-serif' };
    const s = solve();
    if (plane.clientWidth < 60) return;   // 还没排版（或者藏起来了），等 ResizeObserver 再叫

    // 平面
    const size = Math.min(plane.clientWidth, 440);
    const { ctx, w, h } = setup(plane, size);
    const cx = w / 2, cy = h / 2, k = (Math.min(w, h) / 2 - 14) / R;
    geo = { cx, cy, k };
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath(); ctx.moveTo(cx + i * k, 0); ctx.lineTo(cx + i * k, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cy + i * k); ctx.lineTo(w, cy + i * k); ctx.stroke();
    }
    ctx.strokeStyle = C.mute; ctx.globalAlpha = .55;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    ctx.globalAlpha = 1;

    // ROC（环带）：外圈到画布边缘就当 ∞
    const far = Math.hypot(w, h);
    s.rocs.forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(r[1] * k, far), 0, Math.PI * 2);
      if (r[0] > 0) ctx.arc(cx, cy, r[0] * k, 0, Math.PI * 2, true);
      ctx.fillStyle = C.roc; ctx.globalAlpha = st.q === 'two' ? (i % 2 ? .1 : .2) : .18; ctx.fill('evenodd'); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.roc; ctx.lineWidth = 1.5;
      [r[0], r[1]].forEach(b => { if (b > 0 && b !== Infinity) { ctx.beginPath(); ctx.arc(cx, cy, b * k, 0, Math.PI * 2); ctx.stroke(); } });
    });
    // 每个极点所在的半径圈
    ctx.setLineDash([3, 4]); ctx.strokeStyle = C.mute; ctx.lineWidth = 1;
    s.rs.forEach(r => { ctx.beginPath(); ctx.arc(cx, cy, r * k, 0, Math.PI * 2); ctx.stroke(); });
    ctx.setLineDash([]);
    // 单位圆
    ctx.strokeStyle = C.unit; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, k, 0, Math.PI * 2); ctx.stroke();
    ctx.font = C.font; ctx.fillStyle = C.ink;
    ctx.fillText('|z| = 1', cx + k * .72 + 4, cy - k * .72 - 4);
    ctx.fillStyle = C.mute; ctx.fillText('Re', w - 22, cy - 6); ctx.fillText('Im', cx + 6, 14);
    // 极点：红（或该样式的“能动色”）× + 光圈，表示能拖
    st.poles.forEach((p, i) => {
      const x = cx + p.x * k, y = cy - p.y * k, hot = i === st.hover || i === st.drag;
      ctx.fillStyle = C.hand; ctx.globalAlpha = hot ? .28 : .14;
      ctx.beginPath(); ctx.arc(x, y, hot ? 15 : 12, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = C.hand; ctx.lineWidth = 2.5; const d = 5.5;
      ctx.beginPath(); ctx.moveTo(x - d, y - d); ctx.lineTo(x + d, y + d); ctx.moveTo(x - d, y + d); ctx.lineTo(x + d, y - d); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.fillText(fmt(rad(p)), x + 10, y + 17);
    });

    // 半径线：只看 |z|，“夹 1”就是在这条线上找包住 1 的那一段
    const L = setup(line, 70), lc = L.ctx, pad = 18, lw = L.w - pad * 2, X = r => pad + Math.min(r, R) / R * lw, y0 = 30;
    geo.line = { X, pad, lw, y0 };
    lc.fillStyle = C.bg; lc.fillRect(0, 0, L.w, L.h);
    lc.strokeStyle = C.mute; lc.lineWidth = 1; lc.beginPath(); lc.moveTo(pad, y0); lc.lineTo(pad + lw, y0); lc.stroke();
    lc.font = C.font; lc.fillStyle = C.mute; lc.textAlign = 'center';
    for (let t = 0; t <= 3; t++) { lc.beginPath(); lc.moveTo(X(t), y0 - 3); lc.lineTo(X(t), y0 + 3); lc.stroke(); if (t !== 1) lc.fillText(t, X(t), y0 + 18); }
    lc.fillText('|z|', pad + lw + 2, y0 - 8);
    s.rocs.forEach(r => { lc.strokeStyle = C.roc; lc.lineWidth = 6; lc.lineCap = 'round'; lc.beginPath(); lc.moveTo(X(r[0]) + 3, y0); lc.lineTo(X(r[1]) - (r[1] === Infinity ? 0 : 3), y0); lc.stroke(); });
    lc.lineCap = 'butt';
    lc.strokeStyle = C.unit; lc.lineWidth = 2; lc.beginPath(); lc.moveTo(X(1), y0 - 12); lc.lineTo(X(1), y0 + 12); lc.stroke();
    lc.fillStyle = C.unit; lc.fillText('1', X(1), y0 + 26);
    st.poles.forEach((p, i) => {
      const x = X(rad(p)), hot = i === st.hover || i === st.drag;
      lc.fillStyle = C.hand; lc.beginPath(); lc.moveTo(x, y0 - 6); lc.lineTo(x - (hot ? 7 : 5.5), y0 - 17); lc.lineTo(x + (hot ? 7 : 5.5), y0 - 17); lc.closePath(); lc.fill();
    });
    if (s.dead) { lc.fillStyle = C.hand; lc.fillText('极点压在 1 上', X(1), y0 - 22); }

    out.innerHTML = say(s);
    fig.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-pressed', b.value === st.q));
  }

  // ---------- 拖 ----------
  const hitPlane = (mx, my) => st.poles.findIndex(p => Math.hypot(geo.cx + p.x * geo.k - mx, geo.cy - p.y * geo.k - my) < 16);
  const hitLine = mx => st.poles.findIndex(p => Math.abs(geo.line.X(rad(p)) - mx) < 10);
  const snap = (x, y) => { let r = Math.hypot(x, y); const a = Math.atan2(y, x); if (Math.abs(r - 1) < SNAP) r = 1; r = Math.min(Math.max(r, .05), R - .1); return { x: r * Math.cos(a), y: r * Math.sin(a) }; };
  function bind(cv, hit, move) {
    const pos = e => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    cv.addEventListener('pointerdown', e => { const i = hit(...pos(e)); if (i < 0) return; st.drag = st.active = i; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; draw(); });
    cv.addEventListener('pointermove', e => {
      const [mx, my] = pos(e);
      if (st.drag !== undefined) { move(st.drag, mx, my); draw(); return; }
      const i = hit(mx, my); if (i !== st.hover) { st.hover = i; cv.style.cursor = i >= 0 ? 'grab' : 'default'; draw(); }
    });
    const end = () => { if (st.drag === undefined) return; st.drag = undefined; cv.style.cursor = 'grab'; draw(); };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    cv.addEventListener('pointerleave', () => { if (st.drag === undefined && st.hover !== -1) { st.hover = -1; draw(); } });
  }
  bind(plane, hitPlane, (i, mx, my) => { st.poles[i] = snap((mx - geo.cx) / geo.k, (geo.cy - my) / geo.k); });
  bind(line, hitLine, (i, mx) => { const p = st.poles[i], a = Math.atan2(p.y, p.x), r = (mx - geo.line.pad) / geo.line.lw * R; st.poles[i] = snap(r * Math.cos(a), r * Math.sin(a)); });

  // 键盘：Tab 进画布，←→ 改当前极点的半径，[ ] 换极点
  plane.tabIndex = 0;
  plane.addEventListener('keydown', e => {
    const p = st.poles[st.active]; if (!p) return;
    if (e.key === '[' || e.key === ']') { st.active = (st.active + (e.key === ']' ? 1 : st.poles.length - 1)) % st.poles.length; st.hover = st.active; draw(); return; }
    const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? .02 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -.02 : 0;
    if (!d) return; e.preventDefault();
    const r = rad(p) + d, a = Math.atan2(p.y, p.x); st.poles[st.active] = snap(r * Math.cos(a), r * Math.sin(a)); st.hover = st.active; draw();
  });

  // ---------- 控件 + 对外接口（正文里的“试试”按钮也走这里） ----------
  fig.api = {
    set({ poles, q } = {}) {
      if (poles) { const rs = String(poles).split(',').map(s => s.includes('/') ? s.split('/')[0] / s.split('/')[1] : +s); st.poles = polar(rs, rs.map((_, i) => i * 0.0)); st.active = 0; }
      if (q) st.q = q;
      draw();
      fig.classList.remove('flash'); void fig.offsetWidth; fig.classList.add('flash');
    },
  };
  fig.querySelectorAll('.seg button').forEach(b => b.onclick = () => fig.api.set({ q: b.value }));
  fig.querySelectorAll('.presets [data-poles]').forEach(b => b.onclick = () => fig.api.set({ poles: b.dataset.poles }));
  new ResizeObserver(() => draw()).observe(plane);
  draw();
}
