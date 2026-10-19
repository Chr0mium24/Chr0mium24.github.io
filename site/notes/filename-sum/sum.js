// 速查图：文件名列表（能改），按 \d+\.?\d* 把每个文件名里的数字找出来加总。
// 日期、车次、“(2)”这种编号也会被一起加进去；切到“只取最后一个数”对比。
import { flash, seg } from '/assets/fig.js';

const DEFAULT = ['餐饮_128.50.pdf', '打车_36.pdf', '2025-04-09_住宿_420.pdf', '发票(2)_15.5.pdf', '高铁_G1234_553.pdf'];
const RE = /\d+\.?\d*/g;
const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const money = v => (+v.toFixed(2)).toLocaleString('zh-CN', { maximumFractionDigits: 2 });

export default function (fig) {
  const ta = fig.querySelector('textarea'), list = fig.querySelector('.hits'), out = fig.querySelector('.readout');
  const st = { names: DEFAULT.slice(), mode: 'all' };
  const setMode = seg(fig.querySelector('.seg'), v => { st.mode = v; draw(); });

  function draw() {
    if (ta.value !== st.names.join('\n')) ta.value = st.names.join('\n');
    setMode(st.mode);
    let total = 0, all = 0, extra = 0;
    list.innerHTML = st.names.filter(n => n.trim()).map(n => {
      const ms = [...n.matchAll(RE)], used = st.mode === 'all' ? ms : ms.slice(-1);
      let html = '', at = 0, sub = 0;
      ms.forEach(m => {
        const on = used.includes(m);
        html += esc(n.slice(at, m.index)) + `<mark class="${on ? 'on' : 'off'}">${esc(m[0])}</mark>`;
        at = m.index + m[0].length;
        all += parseFloat(m[0]);
        if (on) sub += parseFloat(m[0]);
      });
      html += esc(n.slice(at));
      total += sub;
      if (ms.length > 1) extra++;
      return `<li><span class="fn">${html}</span><span class="sub">${ms.length ? '+ ' + money(sub) : '没有数字'}</span></li>`;
    }).join('');
    out.innerHTML = `${st.mode === 'all' ? '所有数字' : '每个文件只取最后一个数'}加起来：<b class="ok">${money(total)}</b>` +
      (st.mode === 'all' && extra ? `<br><b class="bad">${extra}</b> 个文件名里不止一个数，日期、车次、编号都被当成金额加进去了。` : '') +
      (st.mode === 'last' ? `<br>（所有数字一起加是 ${money(all)}。）` : '');
  }
  ta.addEventListener('input', () => { st.names = ta.value.split('\n'); draw(); });
  fig.api = {
    set(o = {}) {
      if (o.names) st.names = o.names.slice();
      if (o.mode) st.mode = o.mode;
      draw(); flash(fig);
    },
  };
  draw();
}
