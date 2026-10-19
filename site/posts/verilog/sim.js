// 波形图的仿真：每格里信号不变，变化都发生在格子边界上。
// y 是 assign 的组合输出，每格立刻算；q1、q2 是 always @(posedge clk) 里的寄存器：
// 只在 clk 从 0 变 1 的那条边界更新，取的是边界前一格的值（真触发器就是在沿之前采样）。
// 寄存器一开始是 x（null）。blocking = true 时用 =，q2 拿到的是刚更新的 q1。
export const OPS = { '&': (p, q) => p & q, '|': (p, q) => p | q, '^': (p, q) => p ^ q };

export function sim({ a, b, clk, op = '&', blocking = false }) {
  const f = OPS[op], N = a.length, y = a.map((v, i) => f(v, b[i])), q1 = [], q2 = [], edges = [];
  let r1 = null, r2 = null;
  for (let k = 0; k < N; k++) {
    if (k > 0 && clk[k - 1] === 0 && clk[k] === 1) {
      edges.push(k);
      const n1 = y[k - 1], n2 = blocking ? n1 : r1;
      r1 = n1; r2 = n2;
    }
    q1.push(r1); q2.push(r2);
  }
  return { y, q1, q2, edges };
}
