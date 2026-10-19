// 二阶对象 ÿ = u + d(t)，|u| ≤ K，跟踪 r(t)。图和首页小图共用这一份仿真。
// e = y − r，滑模面 s = c·e + ė。五种控制器只差在“怎么把 s 变成 u”。
// 控制器每 TS 秒采样一次（零阶保持），对象用 TS/SUB 的步长积分；噪声加在测量的 y 和 ẏ 上，序列固定，换控制器时比的是同一组噪声。

export const T = 6, TS = 0.001, SUB = 4, N = Math.round(T / TS);
export const REF = {
  step: { r: () => 1, rd: () => 0 },
  sine: { r: t => Math.sin(1.2 * t), rd: t => 1.2 * Math.cos(1.2 * t) },
};
export const dist = (D, t) => D * (1 + 0.3 * Math.sin(2 * t));   // 常值为主、带一点慢变化的扰动，上界 1.3D

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const NOISE = (() => {
  const r = rng(7), a = new Float32Array(2 * N);
  for (let i = 0; i < 2 * N; i++) { let u = 0; while (!u) u = r(); a[i] = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
  return a;
})();

// p = { mode: 'bang'|'hys'|'bl'|'ismc'|'sta', K, c, delta, phi, D, sig, ref, e0: [e, ė] }
export function simulate(p) {
  const { mode, K, c, delta, phi, D, sig } = p, ref = REF[p.ref] || REF.step, dt = TS / SUB;
  const Ki = 3, L = K, k1 = 1.5 * Math.sqrt(L), k2 = 1.1 * L;   // 积分滑模的积分增益；超螺旋按 k₁ = 1.5√L、k₂ = 1.1L
  let y = ref.r(0) + p.e0[0], v = ref.rd(0) + p.e0[1];
  let u = 0, hs = 1, I = 0, w = 0, flips = 0, side = 0, sum = 0, sum2 = 0, n = 0, reach = null;
  const out = { y: new Float32Array(N), r: new Float32Array(N), e: new Float32Array(N), ed: new Float32Array(N), u: new Float32Array(N) };
  for (let k = 0; k < N; k++) {
    const t = k * TS, r = ref.r(t), rd = ref.rd(t);
    const e = y - r, ed = v - rd, sTrue = c * e + ed;
    if (reach == null && Math.abs(sTrue) < 0.05) reach = t;
    const s = c * (e + sig * NOISE[2 * k]) + (ed + 5 * sig * NOISE[2 * k + 1]);   // 速度测量比位置脏 5 倍
    if (mode === 'bang') u = -K * Math.sign(s);
    else if (mode === 'hys') { if (s > delta) hs = 1; else if (s < -delta) hs = -1; u = -K * hs; }
    else if (mode === 'bl') u = -K * Math.max(-1, Math.min(1, s / phi));
    else if (mode === 'ismc') { if (Math.abs(s) < phi) I += s * TS; u = -K * Math.max(-1, Math.min(1, (s + Ki * I) / phi)); }   // 只在边界层里积分，免得到达阶段把积分撑爆
    else { const u0 = -k1 * Math.sqrt(Math.abs(s)) * Math.sign(s) + w; u = Math.max(-K, Math.min(K, u0)); if (u === u0) w -= k2 * Math.sign(s) * TS; }
    // 满幅翻转：u 从 +K/2 以上跳到 −K/2 以下（或反过来）记一次
    if (u > K / 2) { if (side < 0) flips++; side = 1; } else if (u < -K / 2) { if (side > 0) flips++; side = -1; }
    out.y[k] = y; out.r[k] = r; out.e[k] = e; out.ed[k] = ed; out.u[k] = u;
    for (let j = 0; j < SUB; j++) { v += (u + dist(D, t + j * dt)) * dt; y += v * dt; }
    if (t >= T / 2) { sum += e; sum2 += e * e; n++; }
  }
  return { ...out, flips, bias: sum / n, rms: Math.sqrt(sum2 / n), reach };
}
