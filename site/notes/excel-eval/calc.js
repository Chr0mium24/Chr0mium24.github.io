// 速查图：迷你表格。A 列写算式，B 列按那串公式算：
//   =IF(A="","",EVALUATE(IF(RIGHT(TRIM(A),1)="+",LEFT(TRIM(A),LEN(TRIM(A))-1),TRIM(A))))
// 点一行看它一步一步怎么算。EVALUATE 这里只实现加减乘除、乘方、百分号和括号（优先级照 Excel：负号 > % > ^ > * / > + -）。
import { flash } from '/assets/fig.js';

const DEFAULT = ['100*1+300', '100*1+', '  50 * 2+  ', '', '(3+4)*2^2', '1+2+3++'];

class Err extends Error {}
export function evaluate(src) {
  const toks = src.match(/\d+\.?\d*(?:E[+-]?\d+)?|\.\d+(?:E[+-]?\d+)?|[-+*/^%()]|\S/gi) || [];
  let i = 0;
  const peek = () => toks[i], eat = t => { if (toks[i] !== t) throw new Err('#VALUE!'); i++; };
  const expr = () => { let v = term(); while (peek() === '+' || peek() === '-') v = toks[i++] === '+' ? v + term() : v - term(); return v; };
  const term = () => { let v = power(); while (peek() === '*' || peek() === '/') { const op = toks[i++], r = power(); if (op === '/' && r === 0) throw new Err('#DIV/0!'); v = op === '*' ? v * r : v / r; } return v; };
  const power = () => { let v = unary(); while (peek() === '^') { i++; v = v ** unary(); } return v; };
  const unary = () => { let s = 1; while (peek() === '-' || peek() === '+') if (toks[i++] === '-') s = -s; return s * postfix(); };
  const postfix = () => { let v = primary(); while (peek() === '%') { i++; v /= 100; } return v; };
  const primary = () => {
    const t = toks[i++];
    if (t === '(') { const v = expr(); eat(')'); return v; }
    if (t != null && /^[\d.]/.test(t)) return parseFloat(t);
    throw new Err(t && /[a-z]/i.test(t) ? '#NAME?' : '#VALUE!');
  };
  if (!toks.length) throw new Err('#VALUE!');
  const v = expr();
  if (i < toks.length) throw new Err('#VALUE!');
  if (!isFinite(v)) throw new Err('#NUM!');
  return v;
}
const show = v => String(+v.toPrecision(12));
const excelTrim = s => s.replace(/ +/g, ' ').trim();

// 一格的计算过程：返回 [{step, val}]，最后一个是结果
export function steps(a) {
  if (a === '') return [{ k: 'A = ""', v: '""，直接空着' }];
  const t = excelTrim(a), strip = t.endsWith('+'), e = strip ? t.slice(0, -1) : t, out = [];
  out.push({ k: 'TRIM(A)', v: `"${t}"` });
  out.push({ k: 'RIGHT(…,1)="+"', v: strip ? 'TRUE → LEFT 去掉最后一个字符' : 'FALSE → 原样' });
  out.push({ k: '交给 EVALUATE', v: `"${e}"` });
  try { out.push({ k: '结果', v: show(evaluate(e)), ok: true }); } catch (err) { if (!(err instanceof Err)) throw err; out.push({ k: '结果', v: err.message, bad: true }); }
  return out;
}

export default function (fig) {
  const tb = fig.querySelector('tbody'), out = fig.querySelector('.readout');
  const st = { rows: DEFAULT.slice(), sel: 0 };
  tb.innerHTML = st.rows.map((_, r) => `<tr data-r="${r}"><td class="rn">${r + 1}</td><td><input type="text" spellcheck="false" aria-label="A${r + 1}"></td><td class="b"></td></tr>`).join('');
  const trs = [...tb.querySelectorAll('tr')];
  function draw() {
    trs.forEach((tr, r) => {
      const inp = tr.querySelector('input');
      if (inp.value !== st.rows[r]) inp.value = st.rows[r];
      const s = steps(st.rows[r]), last = s.at(-1);
      tr.querySelector('.b').textContent = st.rows[r] === '' ? '' : last.v;
      tr.querySelector('.b').className = 'b' + (last.bad ? ' err' : '');
      tr.classList.toggle('on', r === st.sel);
    });
    const s = steps(st.rows[st.sel]);
    out.innerHTML = `<b>B${st.sel + 1}</b> 怎么来的：<br>` + s.map(x => `${x.k}：${x.ok ? `<b class="ok">${x.v}</b>` : x.bad ? `<b class="bad">${x.v}</b>` : x.v}`).join('<br>');
  }
  tb.addEventListener('input', e => { const tr = e.target.closest('tr'); st.rows[+tr.dataset.r] = e.target.value; st.sel = +tr.dataset.r; draw(); });
  tb.addEventListener('focusin', e => { const tr = e.target.closest('tr'); if (tr && st.sel !== +tr.dataset.r) { st.sel = +tr.dataset.r; draw(); } });
  tb.addEventListener('click', e => { const tr = e.target.closest('tr'); if (tr && st.sel !== +tr.dataset.r) { st.sel = +tr.dataset.r; draw(); } });
  fig.api = {
    set(o = {}) {
      if (o.row != null) st.sel = o.row;
      if (o.a != null) st.rows[st.sel] = o.a;
      if (o.reset) st.rows = DEFAULT.slice();
      draw(); flash(fig);
    },
  };
  draw();
}
