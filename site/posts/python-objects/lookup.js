// 图 2：obj.name 的查找顺序（object.__getattribute__ 的逻辑），一步一步高亮。
// 类和实例跟正文第 5 节那格代码一样：a 是数据描述符，b 是非数据描述符，c 是普通类属性，f 是方法，x 哪儿都没有。
import { flash, seg } from '/assets/fig.js';

const CLS = {
  a: { show: 'Data()', kind: '数据描述符', data: true, get: true, val: "'Data.__get__ 的返回值'" },
  b: { show: 'NonData()', kind: '非数据描述符', get: true, val: "'NonData.__get__ 的返回值'" },
  c: { show: "'C 里的普通值'", kind: '普通值', val: "'C 里的普通值'" },
  f: { show: '&lt;function C.f&gt;', kind: '函数 = 非数据描述符', get: true, val: '&lt;bound method C.f of &lt;C object&gt;&gt;' },
};
const CODE = [
  ['', 'class Data:     # __get__ + __set__'],
  ['', 'class NonData:  # 只有 __get__'],
  ['', 'class C:'],
  ['a', '    a = Data()'],
  ['b', '    b = NonData()'],
  ['c', "    c = 'C 里的普通值'"],
  ['f', '    def f(self): ...'],
  ['', 'obj = C()'],
];
const STEPS = [
  n => `在 <code>type(obj).__mro__</code> = (C, object) 的字典里找 <code>'${n}'</code>（先只看类）`,
  () => '找到的东西是<b>数据描述符</b>吗？（它的类型有 <code>__set__</code> 或 <code>__delete__</code>）',
  n => `<code>'${n}'</code> 在 <code>obj.__dict__</code> 里吗？`,
  () => '找到的东西有 <code>__get__</code> 吗？（非数据描述符；普通函数就是这种）',
  () => '类里找到过东西吗？',
  () => '都没有：类里有 <code>__getattr__</code> 就调它，没有就报错',
];

export default function mount(fig) {
  const box = fig.querySelector('.lk'), out = fig.querySelector('.readout');
  const instBtn = fig.querySelector('.toggle.inst');
  const st = { name: 'b', inst: new Set(), step: -1 };
  const setName = seg(fig.querySelector('.seg.names'), v => { st.name = v; st.step = -1; draw(); });

  // 按真实规则把六步各自的结论算出来：hit = 在这一步返回；skip = 这一步不用看
  function plan() {
    const n = st.name, d = CLS[n], inInst = st.inst.has(n), inst = `'实例里的 ${n}'`;
    return [
      { note: d ? `找到 C.__dict__['${n}'] = ${d.show}（${d.kind}）` : '没找到，descr = None', look: d ? 'cls' : 'none' },
      d?.data ? { hit: true, note: '是 → 调 <code>descr.__get__(obj, C)</code>', val: d.val } : { note: d ? '不是，往下' : '没有 descr，跳过', skip: !d },
      inInst ? { hit: true, note: `在 → 直接返回 <code>obj.__dict__['${n}']</code>，哪怕它也有 __get__ 也不绑定`, val: inst, look: 'inst' } : { note: '不在，往下', look: 'inst' },
      d?.get ? { hit: true, note: n === 'f' ? '有 → 调 <code>f.__get__(obj, C)</code>，函数在这里变成 bound method' : '有 → 调 <code>descr.__get__(obj, C)</code>', val: d.val } : { note: d ? '没有，往下' : '没有 descr，跳过', skip: !d },
      d ? { hit: true, note: '找到过 → 原样返回它', val: d.val } : { note: '没有', skip: true },
      { hit: true, err: true, note: 'C 没定义 <code>__getattr__</code>', val: `AttributeError: 'C' object has no attribute '${n}'` },
    ];
  }

  function draw() {
    const n = st.name, p = plan(), end = p.findIndex(s => s.hit), cur = st.step < 0 ? -1 : Math.min(st.step, end);
    const lookAt = cur >= 0 ? p[cur].look : null;
    const code = CODE.map(([k, t]) => `<span class="ln${k === n ? ' on' : ''}">${t}</span>`).join('');
    const clsRows = Object.entries(CLS).map(([k, d]) => `<tr class="${k === n ? 'me' : ''}${k === n && lookAt === 'cls' ? ' look' : ''}"><td>${k}</td><td>${d.show}</td></tr>`).join('');
    const inst = [...st.inst].sort();
    const instRows = inst.length ? inst.map(k => `<tr class="${k === n ? 'me' : ''}${k === n && lookAt === 'inst' ? ' look' : ''}"><td>${k}</td><td>'实例里的 ${k}'</td></tr>`).join('') : '<tr><td colspan="2" class="empty">（空）</td></tr>';
    const steps = STEPS.map((f, i) => {
      const s = p[i], state = i > cur ? 'todo' : s.hit && i === end ? 'hit' : s.skip ? 'skip' : 'pass';
      return `<li class="${state}${i === cur ? ' cur' : ''}"><div>${f(n)}</div>${i <= cur ? `<div class="v">${s.note}</div>` : ''}</li>`;
    }).join('');
    box.innerHTML = `<pre class="codebox">${code}</pre>
      <div class="dicts">
        <table class="${lookAt === 'cls' || lookAt === 'none' ? 'looking' : ''}"><caption>C.__dict__</caption>${clsRows}</table>
        <table class="${lookAt === 'inst' ? 'looking' : ''}"><caption>obj.__dict__</caption>${instRows}</table>
      </div>
      <ol class="steps">${steps}</ol>`;
    const done = cur === end;
    out.innerHTML = done
      ? `<code>obj.${n}</code> → <b class="${p[end].err ? 'bad' : 'ok'}">${p[end].val}</b>　第 ${end + 1} 步就定了。`
      : cur < 0 ? `点“下一步”，从第 1 步开始查 <code>obj.${n}</code>。` : `第 ${cur + 1} 步没有结论，接着往下。`;
    instBtn.setAttribute('aria-pressed', st.inst.has(n));
    instBtn.textContent = `obj.__dict__ 里${st.inst.has(n) ? '有' : '没有'} '${n}'`;
    fig.querySelector('.btn.step').disabled = done;
  }

  fig.querySelector('.btn.step').addEventListener('click', () => { st.step++; draw(); });
  fig.querySelector('.btn.all').addEventListener('click', () => { st.step = 9; draw(); });
  fig.querySelector('.btn.again').addEventListener('click', () => { st.step = -1; draw(); });
  instBtn.addEventListener('click', () => { st.inst.has(st.name) ? st.inst.delete(st.name) : st.inst.add(st.name); st.step = -1; draw(); });
  fig.api = {
    set(o = {}) {
      if (o.name) { st.name = o.name; setName(o.name); }
      if (o.inst != null) { o.inst ? st.inst.add(st.name) : st.inst.delete(st.name); }
      st.step = o.step === 'end' ? 9 : o.step ?? -1;
      draw(); flash(fig);
    },
  };
  setName(st.name);
  draw();
}
