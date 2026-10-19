// 图：挑包器。条件全是红的；不合的包变淡，并写出为什么。点一行看那个包的档案。
import { flash, seg } from '/assets/fig.js';
import { PACKS, WANTS, judge } from './packs.js';

export default function mount(fig) {
  const list = fig.querySelector('.packs'), out = fig.querySelector('.readout'), capIn = fig.querySelector('input[name=cap]'), wants = fig.querySelector('.wants');
  const st = { ver: 'any', cap: 550, want: [], pick: null };
  const setVer = seg(fig.querySelector('.seg'), v => { st.ver = v; draw(); });
  wants.innerHTML = WANTS.map(w => `<button class="toggle" value="${w}" aria-pressed="false">${w}</button>`).join('');
  wants.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    st.want = st.want.includes(b.value) ? st.want.filter(x => x !== b.value) : [...st.want, b.value]; draw();
  });
  capIn.addEventListener('input', () => { st.cap = +capIn.value; draw(); });
  list.addEventListener('click', e => { const r = e.target.closest('[data-i]'); if (!r) return; st.pick = +r.dataset.i; draw(); });

  function draw() {
    capIn.value = st.cap; fig.querySelector('output[for=cap]').textContent = st.cap >= 550 ? '不限' : st.cap;
    wants.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', st.want.includes(b.value)));
    setVer(st.ver);
    const rows = PACKS.map((p, i) => ({ p, i, why: judge(p, st) })).sort((a, b) => a.why.length - b.why.length || (b.p.mods ?? 0) - (a.p.mods ?? 0));
    const max = 550;
    list.innerHTML = rows.map(({ p, i, why }) => `
      <div class="pk ${why.length ? 'no' : 'yes'} ${st.pick === i ? 'on' : ''}" data-i="${i}">
        <span class="nm">${p.n}${p.mine ? ' <small class="mine">我选的</small>' : ''}</span>
        <span class="bar"><i style="width:${p.mods ? p.mods / max * 100 : 0}%"></i>${st.cap < 550 ? `<b class="cap" style="left:${st.cap / max * 100}%"></b>` : ''}</span>
        <span class="v">${p.modsText ?? p.mods ?? '—'}</span>
        <span class="why">${why.length ? why.join('，') : p.tags.join(' · ')}</span>
      </div>`).join('');
    const ok = rows.filter(r => !r.why.length);
    let s = ok.length ? `剩 <b class="ok">${ok.length} 个</b>：${ok.map(r => r.p.n).join('、')}。` : `<b class="bad">没有同时满足的</b>，去掉一个条件试试。`;
    if (st.pick != null) { const p = PACKS[st.pick]; s += `<br><b>${p.n}</b>　${p.l} · ${p.modsText ?? p.mods ?? '模组数没统计'} 个模组 · 下载 ${p.dl}。${p.note}。`; }
    out.innerHTML = s;
  }
  fig.api = { set(o = {}) { Object.assign(st, { ver: 'any', cap: 550, want: [], pick: null }, o); draw(); flash(fig); } };
  draw();
}
