// 主动学习的玩具：二维“双月”数据，两类（当成 3 号和 4 号装甲板）。
// 模型是三次多项式特征上的逻辑回归（带 L2，用牛顿法训练）。
// 同一个起始小数据集，一边每轮挑熵最高的 K 个去标注，一边每轮随机挑 K 个，比测试集准确率。
// 图（boundary.js）和首页小图（mini.js）都用这里。

export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const gauss = r => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());

// 双月：上弯月是 0 类，下弯月是 1 类；坐标大致落在 [-1, 1]²
export function moons(n, r, noise = .16) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const c = i % 2, t = Math.PI * r();
    let x = c ? 1 - Math.cos(t) : Math.cos(t), y = c ? .5 - Math.sin(t) : Math.sin(t);
    x += gauss(r) * noise; y += gauss(r) * noise;
    pts.push({ x: (x - .5) / 1.6, y: (y - .25) / 1.25, c });
  }
  return pts;
}

export const feats = (x, y) => [1, x, y, x * x, x * y, y * y, x * x * x, x * x * y, x * y * y, y * y * y];
const D = 10;
const sig = z => 1 / (1 + Math.exp(-z));
export const prob = (w, x, y) => { const f = feats(x, y); let z = 0; for (let i = 0; i < D; i++) z += w[i] * f[i]; return sig(z); };
export const entropy = p => p <= 0 || p >= 1 ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));

// 牛顿法：解 (XᵀSX + λI) Δ = Xᵀ(y − p) − λw
export function fit(data, lam = .05, iters = 12) {
  const w = new Array(D).fill(0);
  const F = data.map(d => feats(d.x, d.y));
  for (let it = 0; it < iters; it++) {
    const H = Array.from({ length: D }, () => new Array(D).fill(0)), g = new Array(D).fill(0);
    F.forEach((f, n) => {
      let z = 0; for (let i = 0; i < D; i++) z += w[i] * f[i];
      const p = sig(z), s = Math.max(p * (1 - p), 1e-6), e = data[n].c - p;
      for (let i = 0; i < D; i++) { g[i] += e * f[i]; const si = s * f[i]; for (let j = i; j < D; j++) H[i][j] += si * f[j]; }
    });
    for (let i = 0; i < D; i++) { for (let j = 0; j < i; j++) H[i][j] = H[j][i]; const l = i ? lam : 1e-4; H[i][i] += l; g[i] -= l * w[i]; }
    const dw = solve(H, g);
    let m = 0; for (let i = 0; i < D; i++) { w[i] += dw[i]; m = Math.max(m, Math.abs(dw[i])); }
    if (m < 1e-6) break;
  }
  return w;
}

function solve(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c] || 1e-12;
    for (let r = 0; r < n; r++) if (r !== c) { const k = M[r][c] / d; if (k) for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j]; }
  }
  return M.map((r, i) => r[n] / (M[i][i] || 1e-12));
}

export const accuracy = (w, test) => test.reduce((s, d) => s + ((prob(w, d.x, d.y) > .5 ? 1 : 0) === d.c), 0) / test.length;

// 跑一整轮实验：返回两种策略每一轮的 { n, acc, w, picked(本轮新挑的下标), labeled(全部已标注下标) }
export function run({ seed = 7, pool = 300, test = 600, start = 4, k = 5, budget = 120 } = {}) {
  const r = rng(seed), P = moons(pool, r), T = moons(test, rng(seed * 31 + 1));
  // 起始数据集：两类各一半，随机抽
  const order = [...P.keys()].sort(() => r() - .5);
  const init = [...order.filter(i => P[i].c === 0).slice(0, start / 2), ...order.filter(i => P[i].c === 1).slice(0, start / 2)];
  const sim = mode => {
    const rr = rng(seed * 7 + (mode === 'rand' ? 3 : 5));
    const lab = new Set(init), hist = [];
    let picked = [...init];
    for (;;) {
      const w = fit([...lab].map(i => P[i]));
      hist.push({ n: lab.size, acc: accuracy(w, T), w, picked, labeled: [...lab] });
      if (lab.size >= budget) break;
      const rest = P.map((_, i) => i).filter(i => !lab.has(i)), m = Math.min(k, budget - lab.size);
      if (mode === 'rand') { for (let j = rest.length - 1; j > 0; j--) { const q = Math.floor(rr() * (j + 1)); [rest[j], rest[q]] = [rest[q], rest[j]]; } picked = rest.slice(0, m); }
      else picked = rest.map(i => [i, entropy(prob(w, P[i].x, P[i].y))]).sort((a, b) => b[1] - a[1]).slice(0, m).map(a => a[0]);
      picked.forEach(i => lab.add(i));
    }
    return hist;
  };
  return { pool: P, test: T, rand: sim('rand'), al: sim('al'), k, start, budget };
}
