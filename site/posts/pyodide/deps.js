// 图 1：micropip.install('lcapy') 的依赖解析。数据都是实测的：
//   lcapy 1.26 在 PyPI 上声明的依赖（requires_dist）；Pyodide 314.0.7 的 pyodide-lock.json（版本、依赖、wheel 大小）；
//   import lcapy 时真正要用到的模块（在 Pyodide 314.0.7 里一个个去掉试出来的：先 sympy，再 numpy，再 networkx）。
import { flash, seg } from '/assets/fig.js';

// Pyodide 发行版里的包：版本、依赖、wheel 字节数
export const LOCK = {
  numpy: ['2.4.6', [], 2960568], scipy: ['1.18.0', ['numpy'], 14029750], sympy: ['1.14.0', ['mpmath'], 4185567],
  matplotlib: ['3.10.8', ['contourpy', 'cycler', 'fonttools', 'kiwisolver', 'numpy', 'packaging', 'Pillow', 'pyparsing', 'python-dateutil', 'pytz'], 6982033],
  networkx: ['3.6.1', ['decorator', 'setuptools', 'matplotlib', 'numpy'], 1084840], mpmath: ['1.4.1', [], 430985],
  contourpy: ['1.3.3', ['numpy'], 118874], cycler: ['0.12.1', ['six'], 8321], fonttools: ['4.62.1', [], 1152647],
  kiwisolver: ['1.5.0', [], 36616], packaging: ['26.1', [], 95852], Pillow: ['12.2.0', [], 1037806],
  pyparsing: ['3.3.2', [], 122781], 'python-dateutil': ['2.9.0.post0', ['six'], 229892], pytz: ['2026.1.post1', [], 510489],
  six: ['1.17.0', [], 11050], decorator: ['5.2.1', [], 9167], setuptools: ['82.0.1', ['pyparsing'], 756856],
  ipython: ['9.12.0', [], 0],
};
// lcapy 1.26 的 requires_dist（去掉 extra 的那些），顺序照 PyPI
export const REQS = [
  { name: 'IPython', dist: 'ipython' },
  { name: 'importlib', pypi: null, sdist: 'importlib-1.0.4.zip' },
  { name: 'matplotlib', dist: 'matplotlib' },
  { name: 'networkx', dist: 'networkx' },
  { name: 'numpy', dist: 'numpy' },
  { name: 'packaging', dist: 'packaging' },
  { name: 'property-cached', pypi: 'property_cached-1.6.4-py2.py3-none-any.whl' },
  { name: 'scipy', dist: 'scipy' },
  { name: 'setuptools', dist: 'setuptools' },
  { name: 'sympy>=1.10.1', dist: 'sympy' },
  { name: 'wheel', pypi: 'wheel-0.48.0-py3-none-any.whl' },
];
export const IMPORTS = ['sympy', 'numpy', 'networkx'];   // import lcapy 时按这个顺序用到
export const PRE = ['numpy', 'scipy', 'sympy', 'matplotlib', 'networkx'];

// loadPackage 会把发行版里的依赖一起装上
export function closure(names) {
  const out = new Set(), go = n => { if (out.has(n)) return; out.add(n); LOCK[n][1].forEach(go); };
  names.forEach(go);
  return out;
}
export function outcome(deps, pre) {
  const have = closure(pre);
  if (deps) return { ok: false, err: 'importlib', have };
  const miss = IMPORTS.find(m => !have.has(m));
  return { ok: !miss, miss, have };
}
const MB = b => (b / 1048576).toFixed(1) + ' MB';

export default function mount(fig) {
  const box = fig.querySelector('.dp'), out = fig.querySelector('.readout');
  const st = { deps: true, pre: new Set() };
  const setDeps = seg(fig.querySelector('.seg.deps'), v => { st.deps = v === 'on'; draw(); });
  const toggles = [...fig.querySelectorAll('.pre .toggle')];
  toggles.forEach(b => b.addEventListener('click', () => { st.pre.has(b.value) ? st.pre.delete(b.value) : st.pre.add(b.value); draw(); }));

  function draw() {
    const pre = PRE.filter(p => st.pre.has(p)), r = outcome(st.deps, pre), have = r.have;
    const bytes = [...have].reduce((s, n) => s + LOCK[n][2], 0);
    const loading = [...have].sort();                     // Pyodide 打印 “Loading …” 时按名字排
    const line1 = pre.length
      ? `<code>await pyodide.loadPackage([${pre.map(p => `"${p}"`).join(', ')}])</code><div class="msg">Loading ${loading.join(', ')}　<span>共 ${have.size} 个，下载 ${MB(bytes)}</span></div>`
      : '<code class="skip">（没有先 loadPackage 任何东西）</code>';
    const rows = !st.deps ? `<tr class="off"><td>其余 ${REQS.length} 个</td><td>${REQS.map(q => q.name).join('、')}</td><td>不看</td></tr>` : REQS.map(q => {
      let from, res, cls;
      if (q.dist && have.has(q.dist)) { from = `已经装了（${q.dist} ${LOCK[q.dist][0]}）`; res = '跳过'; cls = 'have'; }
      else if (q.dist) { from = `Pyodide 发行版有 ${q.dist} ${LOCK[q.dist][0]}`; res = '装'; cls = 'dist'; }
      else if (q.pypi) { from = `PyPI：${q.pypi}`; res = '下载'; cls = 'pypi'; }
      else { from = `PyPI 只有 ${q.sdist}（源码包，没有 wheel）`; res = '✗ 找不到'; cls = 'fail'; }
      return `<tr class="${cls}"><td>${q.name}</td><td>${from}</td><td>${res}</td></tr>`;
    }).join('');
    const imp = st.deps ? '<p class="skip">没走到这一步：解析阶段就失败了，micropip 什么都没装。</p>'
      : `<div class="imp">${IMPORTS.map(m => `<span class="${have.has(m) ? 'y' : r.miss === m ? 'n' : 'u'}">${m} ${have.has(m) ? '✓' : r.miss === m ? '✗' : '…'}</span>`).join('<i>→</i>')}</div>`;
    const term = st.deps
      ? `ValueError: Can't find a pure Python 3 wheel for 'importlib'.\nSee: https://pyodide.org/en/stable/usage/faq.html#why-can-t-micropip-find-a-pure-python-wheel-for-a-package\nYou can use \`await micropip.install(..., keep_going=True)\` to get a list of all packages with missing wheels.`
      : r.ok ? `>>> print(cct[2].v)\n5*Heaviside(t)` : `ModuleNotFoundError: No module named '${r.miss}'\nThe module '${r.miss}' is included in the Pyodide distribution, but it is not installed.`;
    box.innerHTML = `
      <div class="stage"><div class="lab">① 先装发行版里的包</div>${line1}</div>
      <div class="stage"><div class="lab">② <code>await micropip.install('lcapy', deps=${st.deps ? 'True' : 'False'})</code></div>
        <div class="table-wrap"><table><thead><tr><th>lcapy 1.26 声明的依赖</th><th>micropip 去哪找</th><th>结果</th></tr></thead>
        <tbody><tr class="pypi"><td><b>lcapy</b></td><td>PyPI：lcapy-1.26-py3-none-any.whl</td><td>${st.deps ? '下载（如果依赖都解析得了）' : '下载'}</td></tr>${rows}</tbody></table></div></div>
      <div class="stage"><div class="lab">③ <code>import lcapy</code>，再跑一个电路</div>${imp}</div>
      <pre class="term ${st.deps || !r.ok ? 'bad' : 'good'}">${term}</pre>`;
    out.innerHTML = st.deps
      ? `<b class="bad">装不上</b>。不管预装了什么，<code>importlib</code> 这一项都解析不了，整个 install 中止。`
      : r.ok ? `<b class="ok">能用了</b>。只装了 lcapy 自己的 wheel，需要的 ${IMPORTS.join('、')} 都已经由 loadPackage 装好。`
      : `<b class="bad">装上了，但 import 失败</b>：缺 <code>${r.miss}</code>。deps=False 的代价就是依赖得自己补。`;
    toggles.forEach(b => {
      const on = st.pre.has(b.value), pulled = !on && have.has(b.value);
      b.setAttribute('aria-pressed', on);
      b.classList.toggle('pulled', pulled);
      b.title = pulled ? '没勾，但被别的包顺带装上了' : '';
    });
  }

  fig.api = {
    set(o = {}) {
      if (o.deps != null) { st.deps = !!o.deps; setDeps(st.deps ? 'on' : 'off'); }
      if (o.pre) st.pre = new Set(o.pre === 'all' ? PRE : o.pre);
      draw(); flash(fig);
    },
  };
  setDeps('on');
  draw();
}
