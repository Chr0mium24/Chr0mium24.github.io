// 图：模拟按快捷键开关一个 App 的窗口。逻辑照正文里的两段代码：
//   目标 App 在前台 → 隐藏；在跑但不在前台 → 激活；没在跑 → open -a 启动。
// 每一步的耗时是示意：osascript 那条按正文说的“开关快一秒”的量级给，Swift 那条是毫秒级；进程启动的量级是在 macOS 15 上实测的（见正文）。
import { flash, seg } from '/assets/fig.js';

export const APPS = [
  { name: 'WeChat', label: '微信', key: 'w' },
  { name: 'Google Chrome', label: 'Chrome', key: 'c' },
  { name: 'Ghostty', label: 'Ghostty', key: 'a' },
];
// 每种实现、每个分支的步骤：[说明, 毫秒]
export function steps(impl, branch) {
  if (impl === 'osa') return [
    ['skhd 起一个 bash 跑脚本', 5],
    ['osascript ①：起 AppleScript，问 System Events 谁在前台', 450],
    branch === 'hide' ? ['osascript ②：再起一次，让 System Events 把它设成不可见', 450]
      : branch === 'activate' ? ['open -a：把它叫到前台', 120] : ['open -a：启动 App（App 自己的启动时间）', 1200],
  ];
  return [
    ['skhd 起编译好的 toggle-app', 4],
    ['NSWorkspace.frontmostApplication：谁在前台', 1],
    branch === 'hide' ? ['frontApp.hide()', 2] : branch === 'activate' ? ['targetApp.activate()', 2] : ['Process 调 open -a：启动 App（App 自己的启动时间）', 1200],
  ];
}
const total = s => s.reduce((a, [, t]) => a + t, 0);

export default function mount(fig) {
  const desk = fig.querySelector('.desk'), tl = fig.querySelector('.tl'), out = fig.querySelector('.readout');
  const keys = [...fig.querySelectorAll('.btn.key')], quit = fig.querySelector('.btn.quit');
  const st = { impl: 'osa', running: { WeChat: true, 'Google Chrome': true, Ghostty: true }, hidden: {}, order: ['Google Chrome', 'WeChat', 'Ghostty'], busy: null, last: null };
  const setImpl = seg(fig.querySelector('.seg.impl'), v => { st.impl = v; draw(); });

  const visible = () => st.order.filter(n => st.running[n] && !st.hidden[n]);
  const front = () => visible()[0] ?? 'Finder';
  const branchFor = n => front() === n ? 'hide' : st.running[n] ? 'activate' : 'launch';
  function activate(n) { st.running[n] = true; st.hidden[n] = false; st.order = [n, ...st.order.filter(x => x !== n)]; }

  function press(n) {
    if (st.busy) return;
    const branch = branchFor(n), s = steps(st.impl, branch), T = total(s), t0 = performance.now();
    st.busy = { n, branch, s, T, t0 };
    const tick = () => {
      const t = performance.now() - t0;
      drawTimeline(Math.min(t, T));
      if (t < T) { st.raf = requestAnimationFrame(tick); return; }
      if (branch === 'hide') st.hidden[n] = true; else activate(n);
      st.last = { n, branch, T, impl: st.impl }; st.busy = null; draw();
    };
    draw(); st.raf = requestAnimationFrame(tick);
  }

  function draw() {
    const vis = visible(), f = front();
    const wins = APPS.map((a, i) => {
      const z = vis.indexOf(a.name), shown = z >= 0;
      return `<div class="win${shown ? '' : ' gone'}${z === 0 ? ' top' : ''}" data-app="${a.name}" style="left:${8 + i * 14}%;top:${15 + i * 9}%;z-index:${shown ? 10 - z : 0}">
        <div class="bar"><i></i><i></i><i></i><span>${a.label}</span></div><div class="body">${a.name === 'Ghostty' ? '<code>~ %</code>' : ''}</div></div>`;
    }).join('');
    const dock = APPS.map(a => `<span class="${st.running[a.name] ? 'on' : ''}${f === a.name ? ' f' : ''}">${a.label}</span>`).join('');
    desk.innerHTML = `<div class="menu"><b>${f === 'Finder' ? '访达' : APPS.find(a => a.name === f).label}</b><span>在前台</span></div>${wins}<div class="dock">${dock}</div>`;
    keys.forEach(k => { k.disabled = !!st.busy; });
    quit.disabled = !!st.busy || !st.running.WeChat;
    if (!st.busy) drawTimeline();
    const L = st.last;
    const what = b => ({ hide: '在前台，所以隐藏', activate: '在跑但不在前台，所以激活', launch: '没在跑，所以启动' })[b];
    out.innerHTML = st.busy ? `⌃⇧${APPS.find(a => a.name === st.busy.n).key.toUpperCase()}：${APPS.find(a => a.name === st.busy.n).label}${what(st.busy.branch)}……`
      : L ? `${APPS.find(a => a.name === L.n).label}${what(L.branch)}。从按下到窗口变化 <b class="${L.T > 100 ? 'bad' : 'ok'}">${fmt(L.T)}</b>（示意）。` +
        (L.branch === 'launch' ? '<br>启动的时间主要花在 App 自己身上，两种写法差不多。' : '')
      : '按一个快捷键试试。点窗口也能把它叫到前台。';
  }

  // 时间轴：当前实现的几步，按时间画成一段段；下面一行给另一种实现做对照
  function drawTimeline(t) {
    const b = st.busy, n = b?.n ?? st.last?.n ?? 'WeChat', branch = b?.branch ?? (st.last ? st.last.branch : branchFor(n));
    const rows = ['osa', 'swift'].map(impl => ({ impl, s: steps(impl, branch) }));
    const scale = Math.max(1000, ...rows.map(r => total(r.s)));
    tl.innerHTML = rows.map(({ impl, s }) => {
      const T = total(s), me = impl === st.impl;
      let acc = 0;
      const segs = s.map(([lab, ms], i) => { const x = acc; acc += ms; return `<span class="sg s${i}" style="left:${x / scale * 100}%;width:${Math.max(.4, ms / scale * 100)}%" title="${lab}：${fmt(ms)}"></span>`; }).join('');
      const prog = me && b ? `<span class="prog" style="left:${t / scale * 100}%"></span>` : '';
      return `<div class="row${me ? ' me' : ''}"><div class="nm">${impl === 'osa' ? 'bash + osascript' : 'Swift 二进制'}<b>${fmt(T)}</b></div><div class="track">${segs}${prog}</div></div>`;
    }).join('') + `<ol class="legend">${steps(st.impl, branch).map(([lab, ms]) => `<li>${lab}<span>${fmt(ms)}</span></li>`).join('')}</ol>`;
  }
  const fmt = ms => ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`;

  keys.forEach(k => k.addEventListener('click', () => press(k.value)));
  quit.addEventListener('click', () => { st.running.WeChat = false; st.hidden.WeChat = false; st.last = null; draw(); });
  desk.addEventListener('click', e => { const w = e.target.closest('.win[data-app]'); if (w && !st.busy && !w.classList.contains('gone')) { activate(w.dataset.app); draw(); } });
  fig.api = {
    set(o = {}) {
      if (st.busy) { cancelAnimationFrame(st.raf); st.busy = null; }   // 正文按钮可以打断正在走的那一次
      if (o.impl) { st.impl = o.impl; setImpl(o.impl); }
      if (o.front) activate(o.front);
      if (o.quit) { st.running[o.quit] = false; st.hidden[o.quit] = false; }
      st.last = null; draw(); flash(fig);
      if (o.press) press(o.press);
    },
  };
  setImpl('osa');
  draw();
}
