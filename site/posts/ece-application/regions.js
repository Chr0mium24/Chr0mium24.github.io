// 图 1：选申请地区 → 建议投几个项目、什么时候交、各地看什么。
// 项目数严格按两条规则：
//   只申英联邦（英、港、新、澳）：2–3 个地区 6–8 个项目，3–5 个地区 8–10 个项目
//   地区里有美国：一共 3–5 个地区，10–12 个项目
// 规则没覆盖的组合就直说没覆盖。
import { palette, canvas2d, onResize, flash } from '/assets/fig.js';

export const REGIONS = ['美国', '英国', '香港', '新加坡', '澳洲', '加拿大', '欧洲'];
const CW = new Set(['英国', '香港', '新加坡', '澳洲', '加拿大']);
const LOOK = { 美国: '软背景 > 硬指标 > 个性化', 英国: '硬指标 > 软背景 > 个性化', 香港: '硬指标 > 软背景', 新加坡: '硬指标 > 软背景', 加拿大: '硬指标 > 软背景', 澳洲: '只看硬指标', 欧洲: '—' };
// 递交窗口：月份按 9 月 = 0 算；null = 没给
const WIN = { 香港: [0, 3], 英国: [1, 4], 新加坡: [1, 4], 美国: [2, 5], 加拿大: [2, 5], 澳洲: 'roll', 欧洲: null };
const US_DL = [[3, '12/1'], [3.45, '12/15'], [4.45, '1/15'], [5, '2/1']];

export function advise(sel) {
  const n = sel.length, us = sel.includes('美国'), eu = sel.includes('欧洲'), onlyCW = sel.every(r => CW.has(r));
  if (!n) return { band: null, why: '先在右边点几个地区。' };
  if (us) {
    if (n >= 3 && n <= 5) return { band: [10, 12], why: `含美国、一共 ${n} 个地区：建议 <b class="ok">10–12 个</b>项目。美国是“综合评估”（holistic review），软背景和个性化占比很重，结果不确定性高，多投几个是为了对冲风险。` };
    return { band: null, why: `含美国的规则只说了“一共 3–5 个地区”的情况（10–12 个项目）；现在是 ${n} 个地区，规则没给数。` };
  }
  if (onlyCW) {
    const ca = sel.includes('加拿大') ? '（加拿大也是英联邦国家，这里按英联邦算。）' : '';
    const why = '英联邦地区的录取标准相对统一、透明，主要看硬指标，你的条件能去哪些学校，范围比较清楚，不用投太多。';
    if (n === 2) return { band: [6, 8], why: `只申英联邦、${n} 个地区：建议 <b class="ok">6–8 个</b>项目。${why}${ca}` };
    if (n === 3) return { band: [6, 10], mid: 8, why: `只申英联邦、3 个地区：正好落在“2–3 个地区 6–8 个”和“3–5 个地区 8–10 个”两档的交界，<b class="ok">6–10 个</b>都在范围里，8 个左右两档都认。${why}${ca}` };
    if (n <= 5) return { band: [8, 10], why: `只申英联邦、${n} 个地区：建议 <b class="ok">8–10 个</b>项目。${why}${ca}` };
    return { band: null, why: `只申英联邦的规则从 2 个地区说起；只选 1 个地区，规则没给数。${ca}` };
  }
  if (eu) return { band: null, why: '欧洲不在这两条规则里：规则只分了“只申英联邦”和“含美国”两种组合。' };
  return { band: null, why: '' };
}

export default function mount(fig) {
  const nl = fig.querySelector('canvas.count'), tl = fig.querySelector('canvas.when'), out = fig.querySelector('.readout');
  const box = fig.querySelector('.regions');
  box.innerHTML = REGIONS.map(r => `<button class="toggle" value="${r}" aria-pressed="false">${r}</button>`).join('');
  const st = { sel: ['英国', '香港', '新加坡'] };
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    st.sel = st.sel.includes(b.value) ? st.sel.filter(r => r !== b.value) : REGIONS.filter(r => r === b.value || st.sel.includes(r));
    draw();
  });

  function draw() {
    const P = palette(fig), A = advise(st.sel);
    box.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', st.sel.includes(b.value)));
    // 数轴：0–14 个项目
    {
      const { ctx, w, h } = canvas2d(nl, 64), x0 = 14, x1 = w - 14, X = v => x0 + v / 14 * (x1 - x0), y = 30;
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = P.mute; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      ctx.font = P.font; ctx.textAlign = 'center'; ctx.fillStyle = P.mute;
      for (let v = 0; v <= 14; v++) { ctx.beginPath(); ctx.moveTo(X(v), y - (v % 2 ? 3 : 5)); ctx.lineTo(X(v), y + (v % 2 ? 3 : 5)); ctx.stroke(); if (!(v % 2)) ctx.fillText(v, X(v), y + 20); }
      if (A.band) {
        const [a, b] = A.band;
        ctx.fillStyle = P.ok; ctx.globalAlpha = .22; ctx.fillRect(X(a), y - 11, X(b) - X(a), 22); ctx.globalAlpha = 1;
        ctx.strokeStyle = P.ok; ctx.lineWidth = 2; ctx.strokeRect(X(a), y - 11, X(b) - X(a), 22); ctx.lineWidth = 1;
        if (A.mid) { ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X(A.mid), y - 11); ctx.lineTo(X(A.mid), y + 11); ctx.stroke(); ctx.setLineDash([]); }
        ctx.fillStyle = P.ok; ctx.font = `600 ${P.font}`; ctx.fillText(`${a}–${b} 个项目`, (X(a) + X(b)) / 2, y - 16);
      } else {
        ctx.fillStyle = P.mute; ctx.fillText(st.sel.length ? '规则没覆盖这个组合' : '还没选地区', (x0 + x1) / 2, y - 14);
      }
    }
    // 时间线：9 月到次年 2 月
    {
      const rows = st.sel.length ? st.sel : [], rh = r => r === '美国' ? 36 : 22, H = 30 + Math.max(22, rows.reduce((a, r) => a + rh(r), 0));
      const { ctx, w, h } = canvas2d(tl, H), lx = 52, x0 = lx + 4, x1 = w - 8, X = m => x0 + m / 6 * (x1 - x0);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
      ctx.font = P.font; ctx.textAlign = 'center';
      ['9月', '10月', '11月', '12月', '1月', '2月'].forEach((s, i) => {
        ctx.strokeStyle = P.grid; ctx.beginPath(); ctx.moveTo(X(i), 4); ctx.lineTo(X(i), h - 20); ctx.stroke();
        ctx.fillStyle = P.mute; ctx.fillText(s, X(i + .5), h - 6);
      });
      if (!rows.length) { ctx.fillStyle = P.mute; ctx.fillText('选了地区就画出递交时间', (x0 + x1) / 2, 22); }
      let y = 8;
      rows.forEach(r => {
        const win = WIN[r];
        ctx.textAlign = 'right'; ctx.fillStyle = P.ink; ctx.fillText(r, lx - 4, y + 11);
        if (win === 'roll') {
          ctx.strokeStyle = P.ref; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(x0, y + 7); ctx.lineTo(x1, y + 7); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
          ctx.textAlign = 'left'; ctx.fillStyle = P.ref; ctx.fillText('滚动录取，五个学期的成绩就能申', x0 + 4, y + 4);
        } else if (win) {
          ctx.fillStyle = P.ref; ctx.globalAlpha = .75; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(X(win[0]), y + 2, X(win[1]) - X(win[0]), 12, 6) : ctx.rect(X(win[0]), y + 2, X(win[1]) - X(win[0]), 12); ctx.fill(); ctx.globalAlpha = 1;
          if (r === '美国') US_DL.forEach(([m, s], j) => { ctx.fillStyle = P.ink; ctx.fillRect(X(m) - 1, y, 2, 16); if (w > 420 || j % 2 === 0) { ctx.textAlign = 'center'; ctx.font = P.font.replace(/^\d+px/, '10px'); ctx.fillText(s, X(m), y + 27); ctx.font = P.font; } });
        } else { ctx.textAlign = 'left'; ctx.fillStyle = P.mute; ctx.fillText('没给统一时间，看各校', x0 + 4, y + 11); }
        y += rh(r);
      });
    }
    const look = st.sel.map(r => `${r}：${LOOK[r]}`).join('<br>');
    out.innerHTML = `${A.why}` + (look ? `<br><br>各地主要看什么：<br>${look}` : '');
  }

  fig.api = { set(o = {}) { if (o.regions) st.sel = REGIONS.filter(r => o.regions.includes(r)); draw(); flash(fig); } };
  onResize(nl, draw);
}
