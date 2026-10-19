// 图 2：毫秒时间戳 → GMT+8 的几点。跟着 timestamp_to_gmt8_time_of_day 的四步走。
import { flash } from '/assets/fig.js';
import { DATE, toGmt8 } from './data.js';

const DAY0 = Date.parse(DATE + 'T00:00:00+08:00');

export default function mount(fig) {
  const input = fig.querySelector('input[name=ms]'), slider = fig.querySelector('input[name=t]'), steps = fig.querySelector('.steps'), out = fig.querySelector('.readout');
  function show(fromSlider) {
    if (fromSlider) input.value = DAY0 + +slider.value * 60e3;
    const raw = input.value.trim(), ms = Number(raw);
    if (!raw || !isFinite(ms)) { out.innerHTML = `<b class="bad">不是数字</b>：代码这里会走到 except，返回 None。`; steps.innerHTML = ''; return; }
    const sec = ms / 1000, utc = new Date(ms).toISOString().replace('T', ' ').slice(0, 19), t8 = toGmt8(ms);
    steps.innerHTML = [
      ['毫秒', ms],
      ['÷ 1000 变成秒', sec],
      ['当 UTC 读', utc],
      ['换到 Etc/GMT-8', new Date(ms + 8 * 3600e3).toISOString().replace('T', ' ').slice(0, 19)],
      ["strftime('%H:%M:%S')", t8],
    ].map(([k, v], i) => `<div class="st"><span class="k">${i + 1}　${k}</span><code>${v}</code></div>`).join('');
    out.innerHTML = `结果 <b class="ok">${t8}</b>。名字叫 <code>Etc/GMT-8</code> 却是 UTC<b>+</b>8：Etc 区的符号是反着写的（POSIX 的老规矩），代码注释特意提了一句，就是因为这个。`;
    if (!fromSlider) slider.value = Math.round(((ms - DAY0) / 60e3 % 1440 + 1440) % 1440);
  }
  input.addEventListener('input', () => show(false));
  slider.addEventListener('input', () => show(true));
  fig.api = { set({ ms } = {}) { if (ms != null) input.value = ms; show(false); flash(fig); } };
  input.value = DAY0 + 14.5 * 3600e3; show(false);
}
