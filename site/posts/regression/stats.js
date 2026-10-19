// 回归用的数和检验：图 1、首页小图共用。都是一元回归 y = a + b·x。

export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export const gauss = r => { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };

// 生成数据：f = { nonlin, hetero, outlier, auto, heavy }。x 等距（顺序就是时间顺序），真值 y = 1 + 0.5x
export const N = 40;
export const truth = (x, f) => 1 + 0.5 * x + (f.nonlin ? 0.15 * (x - 5) ** 2 : 0);
export function generate(f, seed) {
  const r = rng(seed), pts = []; let prev = gauss(r);
  for (let i = 0; i < N; i++) {
    const x = (i + 0.5) / N * 10 + (r() - 0.5) * 0.15;
    let e = gauss(r);
    if (f.auto) { e = 0.85 * prev + Math.sqrt(1 - 0.85 ** 2) * e; prev = e; }
    if (f.heavy) e *= (r() < 0.12 ? 4 : 1) * 0.8;   // 12% 的点噪声大 4 倍：尾巴比正态厚
    if (f.hetero) e *= 0.15 + 0.045 * x * x;        // 越往右越散：喇叭口
    pts.push({ x, y: truth(x, f) + e });
  }
  if (f.outlier) pts[N - 2].y -= 7;
  return pts;
}

const sq = v => v * v;
// 标准正态的分布函数和分位数
export const Phi = z => 0.5 * erfc(-z / Math.SQRT2);
function erfc(x) { const t = 1 / (1 + 0.5 * Math.abs(x)), y = t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); return x >= 0 ? y : 2 - y; }
export function qnorm(p) {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.3577518672690, -30.66479806614716, 2.506628277459239], b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572], c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783], d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  if (p < 0.02425) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - 0.02425) return -qnorm(1 - p);
  const q = p - 0.5, r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

// 只算斜率和普通 SE（重抽时用，要快）
export function quick(pts) {
  const n = pts.length; let mx = 0, my = 0; for (const p of pts) { mx += p.x; my += p.y; } mx /= n; my /= n;
  let sxx = 0, sxy = 0; for (const p of pts) { sxx += sq(p.x - mx); sxy += (p.x - mx) * (p.y - my); }
  const b = sxy / sxx, a = my - b * mx; let sse = 0, hc = 0, nw = 0; const u = [];
  for (const p of pts) { const e = p.y - a - b * p.x; sse += e * e; u.push((p.x - mx) * e); hc += sq(u[u.length - 1]); }
  const L = 3; nw = hc; for (let l = 1; l <= L; l++) { let s = 0; for (let t = l; t < n; t++) s += u[t] * u[t - l]; nw += 2 * (1 - l / (L + 1)) * s; }
  return { a, b, se: Math.sqrt(sse / (n - 2) / sxx), hc1: Math.sqrt(n / (n - 2) * hc) / sxx, nw: Math.sqrt(Math.max(nw, 0)) / sxx };
}

// 拟合 + 五项诊断
export function fit(pts) {
  const n = pts.length, q = quick(pts), { a, b } = q;
  let mx = 0, my = 0; for (const p of pts) { mx += p.x; my += p.y; } mx /= n; my /= n;
  let sxx = 0, sst = 0; for (const p of pts) { sxx += sq(p.x - mx); sst += sq(p.y - my); }
  const e = pts.map(p => p.y - a - b * p.x), sse = e.reduce((s, v) => s + v * v, 0), s2 = sse / (n - 2);
  // 线性：残差对 (x − x̄)² 回归的 t 值（加二次项的检验）
  const z = pts.map(p => sq(p.x - mx)), curv = slopeT(z, e);
  // 独立：Durbin–Watson
  let dw = 0; for (let t = 1; t < n; t++) dw += sq(e[t] - e[t - 1]); dw /= sse;
  // 同方差：Breusch–Pagan，e² 对 x 回归，LM = n·R²，自由度 1
  const e2 = e.map(v => v * v), aux = r2(pts.map(p => p.x), e2), lm = n * aux, pBP = 2 * (1 - Phi(Math.sqrt(lm)));
  // 正态：Jarque–Bera，自由度 2
  const m2 = sse / n, m3 = e.reduce((s, v) => s + v ** 3, 0) / n, m4 = e.reduce((s, v) => s + v ** 4, 0) / n;
  const skew = m3 / m2 ** 1.5, kurt = m4 / (m2 * m2), jb = n / 6 * (skew * skew + sq(kurt - 3) / 4), pJB = Math.exp(-jb / 2);
  // 强影响点：Cook 距离
  const cook = pts.map((p, i) => { const h = 1 / n + sq(p.x - mx) / sxx; return e[i] * e[i] / (2 * s2) * h / sq(1 - h); });
  let ci = 0; cook.forEach((v, i) => { if (v > cook[ci]) ci = i; });
  return { ...q, e, s: Math.sqrt(s2), r2: 1 - sse / sst, curvT: curv, pCurv: 2 * (1 - Phi(Math.abs(curv))), dw, lm, pBP, jb, pJB, skew, kurt, cook: cook[ci], cookI: ci };
}
function slopeT(x, y) {
  const n = x.length; let mx = 0, my = 0; for (let i = 0; i < n; i++) { mx += x[i]; my += y[i]; } mx /= n; my /= n;
  let sxx = 0, sxy = 0; for (let i = 0; i < n; i++) { sxx += sq(x[i] - mx); sxy += (x[i] - mx) * (y[i] - my); }
  const b = sxy / sxx; let sse = 0; for (let i = 0; i < n; i++) sse += sq(y[i] - my - b * (x[i] - mx));
  return b / Math.sqrt(sse / (n - 2) / sxx);
}
function r2(x, y) {
  const n = x.length; let mx = 0, my = 0; for (let i = 0; i < n; i++) { mx += x[i]; my += y[i]; } mx /= n; my /= n;
  let sxx = 0, sxy = 0, syy = 0; for (let i = 0; i < n; i++) { sxx += sq(x[i] - mx); sxy += (x[i] - mx) * (y[i] - my); syy += sq(y[i] - my); }
  return sxy * sxy / (sxx * syy);
}

// 按当前开关重抽 M 组：斜率真实的波动 vs 各种 SE 的平均
export function monteCarlo(f, M = 400) {
  let sb = 0, sb2 = 0, se = 0, hc = 0, nw = 0;
  for (let m = 0; m < M; m++) { const q = quick(generate(f, 1000 + m)); sb += q.b; sb2 += q.b * q.b; se += q.se; hc += q.hc1; nw += q.nw; }
  const mean = sb / M; return { mean, sd: Math.sqrt(sb2 / M - mean * mean), se: se / M, hc1: hc / M, nw: nw / M };
}
