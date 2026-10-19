// 速查图：虚拟键盘。点修饰键（⌘ ⇧ ⌥ ⌃ fn）筛出带这些键的快捷键，点普通键再按键筛，也能搜。
// 键盘上绿色的键 = 在当前修饰键下有快捷键。点下面列表里的一条，键盘上就亮出它要按的键。
import { flash } from '/assets/fig.js';

// m：c = ⌘，s = ⇧，o = ⌥，t = ⌃，f = fn；k：键（数组 = 几个键都行），then：松开后再按
export const LIST = [
  { g: '窗口', m: 'c', k: 'W', d: '关闭窗口或标签页' },
  { g: '窗口', m: 'c', k: 'Q', d: '退出应用' },
  { g: '窗口', m: 'c', k: 'T', d: '新建标签页' },
  { g: '窗口', m: 'c', k: 'N', d: '新建窗口' },
  { g: '窗口', m: 'c', k: 'Tab', d: '切换应用' },
  { g: '窗口', m: 'c', k: ',', d: '打开偏好设置' },
  { g: '窗口', m: 'c', k: 'H', d: '隐藏当前应用的窗口' },
  { g: '窗口', m: 'co', k: 'H', d: '隐藏其他应用' },
  { g: '窗口', m: 'c', k: '`', d: '切换同一个应用的窗口' },
  { g: '窗口', m: 'f', k: 'H', d: '显示桌面' },
  { g: '窗口', m: 'f', k: 'F', d: '全屏 / 退出全屏' },
  { g: '窗口', m: 'ft', k: ['←', '↑', '↓', '→'], d: '把窗口贴到屏幕左 / 上 / 下 / 右半边' },
  { g: '窗口', m: 'fts', k: ['←', '↑', '↓', '→'], d: '两个窗口左右或上下并排' },
  { g: '截屏', m: 'cs', k: '3', d: '全屏截图' },
  { g: '截屏', m: 'cs', k: '4', d: '区域截图' },
  { g: '截屏', m: 'cs', k: '4', then: 'Space', d: '窗口截图（按完再按一下空格）' },
  { g: '截屏', m: 'cs', k: '5', d: '打开截图工具栏' },
  { g: '截屏', m: 'cst', k: ['3', '4'], d: '截图直接进剪贴板，不存到桌面' },
  { g: 'Dock', m: 'c', k: 'click', d: '按住点 Dock 图标：在访达里打开文件位置' },
  { g: 'Dock', m: 'f', k: 'A', d: '显示 / 隐藏 Dock' },
  { g: '其他', m: 'so', k: 'Vol', d: '微调音量' },
  { g: '其他', m: 'f', k: 'E', d: '表情与符号' },
  { g: '其他', m: 'f', k: 'C', d: '打开控制中心' },
  { g: '其他', m: 'f', k: 'Q', d: '新建快速备忘录' },
  { g: '其他', m: 'f', k: 'N', d: '打开通知中心' },
  { g: '其他', m: 'oc', k: 'Esc', d: '强制退出应用' },
  { g: '文本编辑', m: 'c', k: ['←', '→'], d: '跳到行首 / 行尾' },
  { g: '文本编辑', m: 's', k: ['←', '↑', '↓', '→'], d: '多选文本' },
  { g: '文本编辑', m: 'f', k: 'Delete', d: '向前删除（相当于 Windows 的 Delete）' },
  { g: '文本编辑', m: 'f', k: '↑', d: 'Page Up（向上翻页）' },
  { g: '文本编辑', m: 'f', k: '↓', d: 'Page Down（向下翻页）' },
  { g: '文本编辑', m: 'f', k: '←', d: 'Home（跳到开头）' },
  { g: '文本编辑', m: 'f', k: '→', d: 'End（跳到末尾）' },
  { g: '文本编辑', m: 't', k: 'A', d: '移到行首' },
  { g: '文本编辑', m: 't', k: 'E', d: '移到行尾' },
  { g: '文本编辑', m: 'o', k: '←', d: '跳到前一个单词' },
  { g: '文本编辑', m: 'o', k: '→', d: '跳到后一个单词' },
  { g: '访达', m: 'c', k: 'dblclick', d: '按住双击文件夹：在新窗口打开' },
  { g: '访达', m: 'c', k: 'K', d: '连接服务器' },
  { g: '访达', m: 'cs', k: '.', d: '显示 / 隐藏隐藏文件' },
  { g: '访达', m: 'cs', k: 'G', d: '前往文件夹' },
  { g: '访达', m: 'cs', k: 'N', d: '新建文件夹' },
  { g: '访达', m: 'ct', k: 'N', d: '用选中的文件新建文件夹' },
  { g: '访达', m: 'c', k: '↑', d: '返回上层文件夹' },
  { g: '访达', m: 'c', k: ['↓', 'O'], d: '打开选中的文件' },
  { g: '访达', m: 'c', k: 'I', d: '显示简介（能改默认打开方式和图标）' },
  { g: '访达', m: 'c', k: 'Delete', d: '把选中的文件移到废纸篓；在废纸篓里按是“放回原处”' },
];

const MOD = { c: ['⌘', 'Command'], s: ['⇧', 'Shift'], o: ['⌥', 'Option'], t: ['⌃', 'Control'], f: ['fn', 'Fn / 🌐'] };
const ORDER = 'ftosc'; // 显示顺序：fn ⌃ ⌥ ⇧ ⌘
const ROWS = [
  [['Esc', 1.3], ['', 9.7, 'gap'], ['Vol', 2.6, '', '音量']],
  [['`', 1], ['1', 1], ['2', 1], ['3', 1], ['4', 1], ['5', 1], ['6', 1], ['7', 1], ['8', 1], ['9', 1], ['0', 1], ['-', 1], ['=', 1], ['Delete', 1.6, '', '⌫']],
  [['Tab', 1.5, '', '⇥'], ['Q', 1], ['W', 1], ['E', 1], ['R', 1], ['T', 1], ['Y', 1], ['U', 1], ['I', 1], ['O', 1], ['P', 1], ['[', 1], [']', 1], ['\\', 1.1]],
  [['', 1.8, 'gap'], ['A', 1], ['S', 1], ['D', 1], ['F', 1], ['G', 1], ['H', 1], ['J', 1], ['K', 1], ['L', 1], [';', 1], ["'", 1], ['Return', 1.8, '', '↩']],
  [['s', 2.3, 'mod'], ['Z', 1], ['X', 1], ['C', 1], ['V', 1], ['B', 1], ['N', 1], ['M', 1], [',', 1], ['.', 1], ['/', 1], ['s', 2.3, 'mod']],
  [['f', 1, 'mod'], ['t', 1, 'mod'], ['o', 1, 'mod'], ['c', 1.3, 'mod'], ['Space', 4.6, '', '空格'], ['c', 1.3, 'mod'], ['o', 1, 'mod'], ['←', .9], ['↑', .9], ['↓', .9], ['→', .9]],
];
const keysOf = s => [].concat(s.k, s.then ? [s.then] : []);
const caps = s => [...ORDER].filter(m => s.m.includes(m)).map(m => `<kbd>${MOD[m][0]}</kbd>`).join('') +
  (s.k === 'click' ? '<span class="act">点击</span>' : s.k === 'dblclick' ? '<span class="act">双击</span>' : [].concat(s.k).map(k => `<kbd>${k === 'Vol' ? '音量键' : k}</kbd>`).join('<i>/</i>')) +
  (s.then ? `<i>然后</i><kbd>${s.then === 'Space' ? '空格' : s.then}</kbd>` : '');

export default function (fig) {
  const kb = fig.querySelector('.kb'), list = fig.querySelector('.sc-list'), q = fig.querySelector('input[type=search]'), out = fig.querySelector('.readout');
  const st = { mods: '', key: null, q: '', pick: null };
  kb.innerHTML = ROWS.map(r => `<div class="kr">${r.map(([k, w, t, label]) => t === 'gap' ? `<span class="kgap" style="flex:${w}"></span>` :
    `<button type="button" class="k${t === 'mod' ? ' mod' : ''}" style="flex:${w}" data-${t === 'mod' ? 'm' : 'k'}="${k.replace(/"/g, '&quot;')}">${t === 'mod' ? MOD[k][0] : label || k}</button>`).join('')}</div>`).join('');
  const keyBtns = [...kb.querySelectorAll('[data-k]')], modBtns = [...kb.querySelectorAll('[data-m]')];

  const has = s => [...st.mods].every(m => s.m.includes(m));
  const match = s => has(s) && (!st.key || keysOf(s).includes(st.key)) && (!st.q || (s.d + s.g + keysOf(s).join(' ') + [...s.m].map(m => MOD[m].join(' ')).join(' ')).toLowerCase().includes(st.q.toLowerCase()));

  function draw() {
    const shown = LIST.filter(match), exact = LIST.filter(s => s.m.length === st.mods.length && has(s));
    const live = new Set(shown.flatMap(keysOf)), sharp = new Set(exact.flatMap(keysOf)), pk = st.pick != null ? LIST[st.pick] : null;
    keyBtns.forEach(b => {
      const k = b.dataset.k;
      b.classList.toggle('live', live.has(k));
      b.classList.toggle('sharp', !!st.mods && sharp.has(k));
      b.classList.toggle('sel', st.key === k);
      b.classList.toggle('pk', !!pk && keysOf(pk).includes(k));
    });
    modBtns.forEach(b => { b.setAttribute('aria-pressed', st.mods.includes(b.dataset.m)); b.classList.toggle('pk', !!pk && pk.m.includes(b.dataset.m)); });
    const groups = [...new Set(LIST.map(s => s.g))];
    list.innerHTML = groups.map(g => {
      const items = shown.filter(s => s.g === g);
      return items.length ? `<h4>${g}</h4><ul>${items.map(s => { const i = LIST.indexOf(s); return `<li data-i="${i}" class="${i === st.pick ? 'on' : ''}"><span class="caps">${caps(s)}</span><span class="d">${s.d}</span></li>`; }).join('')}</ul>` : '';
    }).join('') || '<p class="none">没有对上的快捷键。</p>';
    const ms = [...ORDER].filter(m => st.mods.includes(m)).map(m => MOD[m][0]).join(' ');
    out.innerHTML = `${ms ? `按住 <b>${ms}</b>` : '没按修饰键'}${st.key ? `，键 <b>${st.key}</b>` : ''}${st.q ? `，搜“${st.q}”` : ''}：<b class="ok">${shown.length}</b> 条。` +
      (st.mods && !st.key ? `键盘上深绿的键正好是这几个修饰键，浅绿的还要再加别的修饰键。` : '');
  }

  kb.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.m) { const m = b.dataset.m; st.mods = st.mods.includes(m) ? st.mods.replace(m, '') : st.mods + m; }
    else st.key = st.key === b.dataset.k ? null : b.dataset.k;
    st.pick = null; draw();
  });
  list.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (!li) return; const i = +li.dataset.i; st.pick = st.pick === i ? null : i; draw(); });
  q.addEventListener('input', () => { st.q = q.value.trim(); st.pick = null; draw(); });
  fig.querySelector('.clear').addEventListener('click', () => { st.mods = ''; st.key = null; st.q = ''; st.pick = null; q.value = ''; draw(); });
  fig.api = {
    set(o = {}) {
      if (o.mods != null) st.mods = o.mods;
      if ('key' in o) st.key = o.key;
      if (o.q != null) { st.q = o.q; q.value = o.q; }
      st.pick = null; draw(); flash(fig);
    },
  };
  draw();
}
