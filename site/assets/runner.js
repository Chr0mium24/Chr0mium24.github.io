// 能跑的代码格：<div class="runner"><pre>代码</pre></div>
// mount(el) 把里面的 <pre> 换成可编辑的代码 + 红色“运行”按钮；第一次点才从 CDN 拉 Pyodide（浏览器里的 CPython）。
// 选项（写在 div 上）：
//   data-fresh     每次运行都用一个全新的解释器（默认同一页的代码格共用一个，像 notebook）
//   data-note="…"  按钮旁边的一句提示，比如“要下载 30 MB”
// print 的内容进下方的输出框；报错的 traceback 去掉 Pyodide 自己的那几层；最后一行如果是表达式，像交互式环境一样显示它的值。

export const PYODIDE_VERSION = '314.0.7';
const CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.mjs`;

const CSS = `
.runner { margin: 1.2rem 0; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); overflow: hidden; }
.runner > pre { margin: 0; border-radius: 0; }
.runner textarea { display: block; width: 100%; box-sizing: border-box; margin: 0; border: 0; border-bottom: 1px solid var(--line); resize: none; overflow: auto hidden;
  font: 13px/1.6 var(--mono); tab-size: 4; background: #efeadd; color: var(--ink); padding: .8rem 1rem; white-space: pre; outline: none; }
.runner textarea:focus { box-shadow: inset 2px 0 var(--hand); }
.runner .bar { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; padding: .45rem .8rem; font-size: .8rem; color: var(--mute); }
.runner .bar .btn.run { background: var(--hand); border-color: var(--hand); color: #fff; }
.runner .bar .btn.run:disabled { opacity: .55; cursor: progress; }
.runner .bar .btn.reset[hidden] { display: none; }
.runner .bar .st { flex: 1; min-width: 8rem; overflow-wrap: anywhere; }
.runner .out { margin: 0; border-radius: 0; border-top: 1px dashed var(--line); background: var(--fig-bg); font: 12.5px/1.6 var(--mono); padding: .6rem 1rem; max-height: 24rem; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; }
.runner .out:empty { display: none; }
.runner .out .err { color: var(--ink2); background: color-mix(in srgb, var(--ink) 6%, transparent); display: block; margin: .1rem -1rem; padding: 0 1rem; box-shadow: inset 2px 0 var(--ink2); }
.runner .out .val { color: var(--fig-ok); }
.runner .out .sys { color: var(--mute); }
`;

let shared = null;          // 同一页共用的解释器（Promise）
let queue = Promise.resolve();
let mod = null;

function injectCss() {
  if (document.getElementById('runner-css')) return;
  document.head.append(Object.assign(document.createElement('style'), { id: 'runner-css', textContent: CSS }));
}

// 每个解释器里装一个小帮手：按“第几格”给代码起文件名并登记进 linecache（traceback 才能显示出错的那行），
// 最后一行是表达式就返回它的 repr
const HELPER = `
import linecache
from pyodide.code import eval_code_async as _runner_eval
_runner_n = 0
async def _runner_exec(src):
    global _runner_n
    _runner_n += 1
    name = f'<第 {_runner_n} 次运行>'
    linecache.cache[name] = (len(src), None, src.splitlines(True), name)
    v = await _runner_eval(src, globals(), filename=name)
    return None if v is None else repr(v)
`;

async function boot() {
  mod ??= import(CDN);
  const { loadPyodide } = await mod;
  const py = await loadPyodide({ stdout: () => {}, stderr: () => {} });
  py.runPython(HELPER, { filename: '/_runner.py' });
  return py;
}

// traceback 里 Pyodide 自己的帧（_pyodide/_base.py 之类）对读者没用，删掉
function cleanTraceback(msg) {
  const lines = String(msg).replace(/\s+$/, '').split('\n'), out = [];
  let skip = false;
  for (const l of lines) {
    if (/^\s{2}File "/.test(l)) skip = /\/_pyodide\/|\/_runner\.py"|\/site-packages\/micropip\//.test(l);
    else if (!/^\s/.test(l)) skip = false;
    if (!skip) out.push(l);
  }
  return out.join('\n');
}

export function mount(el) {
  if (el.dataset.mounted) return el.api;
  el.dataset.mounted = '1';
  injectCss();
  const pre = el.querySelector('pre');
  const original = (pre?.textContent ?? '').replace(/^\n/, '').replace(/\s+$/, '');
  const ta = Object.assign(document.createElement('textarea'), { value: original, spellcheck: false, wrap: 'off' });
  ta.setAttribute('aria-label', 'Python 代码，可以改');
  ta.autocapitalize = 'off'; ta.autocomplete = 'off';
  const bar = document.createElement('div'); bar.className = 'bar';
  const run = Object.assign(document.createElement('button'), { className: 'btn run', type: 'button', textContent: '▶ 运行' });
  const reset = Object.assign(document.createElement('button'), { className: 'btn reset', type: 'button', textContent: '还原代码', hidden: true });
  const st = Object.assign(document.createElement('span'), { className: 'st', textContent: el.dataset.note || '点“运行”在浏览器里跑（第一次要下载 Pyodide，约 10 MB）' });
  const out = document.createElement('pre'); out.className = 'out'; out.setAttribute('aria-live', 'polite');
  bar.append(run, reset, st);
  pre ? pre.replaceWith(ta) : el.prepend(ta);
  el.append(bar, out);

  const fit = () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 2 + 'px'; };
  ta.addEventListener('input', () => { fit(); reset.hidden = ta.value === original; });
  ta.addEventListener('keydown', e => {
    if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); ta.setRangeText('    ', ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); go(); }
  });
  reset.addEventListener('click', () => { ta.value = original; ta.dispatchEvent(new Event('input')); });
  requestAnimationFrame(fit); new ResizeObserver(fit).observe(ta);

  const write = (text, cls) => {
    const s = document.createElement('span'); if (cls) s.className = cls;
    s.textContent = text.endsWith('\n') ? text : text + '\n';
    out.append(s); out.scrollTop = out.scrollHeight;
  };

  async function go() {
    run.disabled = true; out.textContent = '';
    const job = queue.then(async () => {
      const fresh = 'fresh' in el.dataset;
      const t0 = performance.now();
      if (!mod || fresh || !shared) st.textContent = fresh ? '启动一个新的 Python…' : '下载、启动 Pyodide…';
      let py;
      try { py = await (fresh ? boot() : (shared ??= boot())); }
      catch (err) { if (!fresh) shared = null; st.textContent = '没加载上 Pyodide（网络？）'; write(String(err), 'err'); return; }
      const t1 = performance.now();
      py.setStdout({ batched: s => write(s) });
      py.setStderr({ batched: s => write(s, 'err') });
      st.textContent = '运行中…';
      try {
        await py.loadPackagesFromImports(ta.value, { messageCallback: m => write(m, 'sys'), errorCallback: m => write(m, 'err') });
        const v = await py.globals.get('_runner_exec')(ta.value);
        if (v != null) write(v, 'val');
        st.textContent = `跑完了 · ${((performance.now() - t1) / 1000).toFixed(2)} s` + (t1 - t0 > 300 ? `（加载 ${((t1 - t0) / 1000).toFixed(1)} s）` : '');
      } catch (err) {
        write(cleanTraceback(err.message ?? err), 'err');
        st.textContent = `出错了：${err.type ?? 'Error'}`;
      }
    });
    queue = job.catch(() => {});
    await job; run.disabled = false;
  }
  run.addEventListener('click', go);
  el.api = { run: go, get code() { return ta.value; }, set code(v) { ta.value = v; ta.dispatchEvent(new Event('input')); }, out };
  return el.api;
}

// 页面里所有 .runner 一次挂好
export function mountAll(root = document) { root.querySelectorAll('.runner').forEach(mount); }
