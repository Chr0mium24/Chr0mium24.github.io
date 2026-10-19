// 图：|X(z)| = |z/(z−a)| 在 z 平面上的曲面。绿 = ROC 里（级数收敛），灰 = ROC 外（闭式还能算，级数早炸了）。
// 拖 z（红色滑块）看部分和；api.set({ z, a, view }) 给正文的“放进图里”用。
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { palette, flash, seg } from '/assets/fig.js';

export default function mount(fig) {
  const P = palette(fig);
  const cv = fig.querySelector('canvas.surf'), zIn = fig.querySelector('input[name=z]'), aIn = fig.querySelector('input[name=a]');
  const R = 2.2, CAP = 4, HS = 0.55;
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(new THREE.Color(P.bg));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const controls = new OrbitControls(camera, cv);
  controls.enableDamping = true; controls.maxPolarAngle = Math.PI * 0.49; controls.minDistance = 4; controls.maxDistance = 16;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b2a4, 2.2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(3, 6, 4); scene.add(sun);

  const mag = (x, y, a) => { const dx = x - a; return Math.sqrt((x * x + y * y) / (dx * dx + y * y)); };
  const Pt = (x, y, h) => new THREE.Vector3(x, h * HS, -y);
  // 曲面颜色：ROC 里用 ok 色和白色调淡，ROC 外用纸灰
  const inside = new THREE.Color(P.ok).lerp(new THREE.Color('#ffffff'), 0.55), outside = new THREE.Color('#d9d5cb');
  let surf, wire, extras = [];

  function build(a) {
    [surf, wire, ...extras].forEach(o => o && (scene.remove(o), o.geometry.dispose()));
    extras = [];
    // 以极点为圆心、半径按对数分布：尖顶附近够密，截顶是干净的圆口
    const RMIN = a / (CAP - 1), RMAX = 2.6, NR = 90, NA = 180, pos = [], col = [], idx = [];
    for (let i = 0; i <= NR; i++) for (let k = 0; k <= NA; k++) {
      const rho = RMIN * Math.pow(RMAX / RMIN, i / NR), th = k / NA * Math.PI * 2;
      const x = a + rho * Math.cos(th), y = rho * Math.sin(th), h = Math.min(mag(x, y, a), CAP);
      pos.push(x, h * HS, -y);
      const c = Math.hypot(x, y) > a ? inside : outside; col.push(c.r, c.g, c.b);
    }
    const id = (i, k) => i * (NA + 1) + k;
    for (let i = 0; i < NR; i++) for (let k = 0; k < NA; k++) idx.push(id(i, k), id(i + 1, k), id(i + 1, k + 1), id(i, k), id(i + 1, k + 1), id(i, k + 1));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals();
    surf = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
    scene.add(surf);

    // 网格线：Re/Im 直线贴在曲面上
    const lp = [], ok = (x, y) => { const d = Math.hypot(x - a, y); return d <= RMAX && d >= RMIN; };
    const line = f => { let prev = null; for (let s = 0; s <= 240; s++) { const [x, y] = f(-R - .4 + (2 * R + 1.4) * s / 240); const p = ok(x, y) ? Pt(x, y, Math.min(mag(x, y, a), CAP) + .004) : null; if (p && prev) lp.push(prev, p); prev = p; } };
    for (let v = -2.5; v <= 3.01; v += 0.25) { line(t => [v, t]); line(t => [t, v]); }
    wire = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lp), new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.11 }));
    scene.add(wire);

    const add = (pts, color, seg = false) => { const G = new THREE.BufferGeometry().setFromPoints(pts), M = new THREE.LineBasicMaterial({ color }); const l = seg ? new THREE.LineSegments(G, M) : new THREE.Line(G, M); scene.add(l); extras.push(l); };
    const ring = (r, onFloor) => { const pts = []; for (let t = 0; t <= 256; t++) { const th = t / 256 * Math.PI * 2, x = r * Math.cos(th), y = r * Math.sin(th); pts.push(Pt(x, y, onFloor ? 0 : Math.min(mag(x, y, a), CAP) + .02)); } return pts; };
    add(ring(1, false), new THREE.Color(P.ref)); add(ring(1, true), new THREE.Color(P.ref).lerp(new THREE.Color('#ffffff'), .5)); add(ring(a, true), 0x555555);
    const s = .07; add([Pt(a - s, -s, 0), Pt(a + s, s, 0), Pt(a - s, s, 0), Pt(a + s, -s, 0)], 0x222222, true);
    const o = []; for (let t = 0; t < 32; t++) { const t1 = t / 32 * 2 * Math.PI, t2 = (t + 1) / 32 * 2 * Math.PI; o.push(Pt(.07 * Math.cos(t1), .07 * Math.sin(t1), 0), Pt(.07 * Math.cos(t2), .07 * Math.sin(t2), 0)); }
    add(o, 0x222222, true);
    add([Pt(-2.1, 0, 0), Pt(3.1, 0, 0), Pt(0, -2.6, 0), Pt(0, 2.6, 0)], 0xbbbbbb, true);
  }

  // 探针：红点 + 虚线落到地面
  const probe = new THREE.Mesh(new THREE.SphereGeometry(0.065, 20, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color(P.hand) }));
  const drop = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineDashedMaterial({ color: new THREE.Color(P.hand), dashSize: .05, gapSize: .04 }));
  scene.add(probe, drop);

  let builtA = null;
  function update() {
    const z = +zIn.value, a = +aIn.value, q = a / z;
    if (a !== builtA) { build(a); builtA = a; }
    const h = Math.min(mag(z, 0, a), CAP);
    probe.position.copy(Pt(z, 0, h)); drop.geometry.setFromPoints([Pt(z, 0, h), Pt(z, 0, 0)]); drop.computeLineDistances();
    fig.querySelector('output[for=z]').textContent = z.toFixed(2);
    fig.querySelector('output[for=a]').textContent = a.toFixed(2);
    const S = []; let s = 0, t = 1; for (let n = 0; n < 10; n++) { s += t; S.push(s); t *= q; }
    const closed = 1 / (1 - q), ok = z > a;
    const f = v => Math.abs(v) >= 1000 ? v.toExponential(1) : v.toFixed(Math.abs(v) < 10 ? 3 : 1);
    fig.querySelector('.readout').innerHTML = ok
      ? `z = ${z.toFixed(2)} 在 ROC 里（|z| > ${a}），公比 q = ${q.toFixed(3)}：部分和收敛到 <b class="ok">${f(closed)}</b>，和闭式一样。`
      : `z = ${z.toFixed(2)} 在 ROC 外，公比 q = ${q.toFixed(3)}：部分和一直涨，<b class="bad">发散</b>；闭式却给 ${f(closed)}。`;
    fig.querySelector('.sums').textContent = 'S = ' + S.slice(0, 6).map(f).join(', ') + ' …';
    chart(S, closed, ok);
  }

  function chart(S, closed, ok) {
    const W = 240, H = 130, pad = 26, top = 8, bot = H - 16;
    const all = [...S, closed, 0], lo = Math.min(...all), hi = Math.max(...all);
    const y = v => bot - (v - lo) / (hi - lo || 1) * (bot - top), bw = (W - pad) / S.length;
    let svg = `<line x1="${pad}" x2="${W}" y1="${y(0)}" y2="${y(0)}" stroke="${P.mute}"/>`;
    S.forEach((v, n) => {
      const x = pad + n * bw + 2, y0 = y(0), y1 = y(v);
      svg += `<rect x="${x}" width="${bw - 4}" y="${Math.min(y0, y1)}" height="${Math.max(1, Math.abs(y1 - y0))}" rx="2" fill="${ok ? P.ok : P.mute}"><title>S${n} = ${v.toFixed(4)}</title></rect>`;
      svg += `<text x="${x + (bw - 4) / 2}" y="${H - 4}" font-size="8" text-anchor="middle" fill="${P.mute}">${n}</text>`;
    });
    svg += `<line x1="${pad}" x2="${W}" y1="${y(closed)}" y2="${y(closed)}" stroke="${P.ink}" stroke-dasharray="4 3"/>`;
    svg += `<text x="${pad - 3}" y="${y(closed) + 3}" font-size="8" text-anchor="end" fill="${P.ink}">${closed.toFixed(Math.abs(closed) >= 10 ? 1 : 2)}</text>`;
    fig.querySelector('svg.chart').innerHTML = svg;
  }

  const views = { tilt: [[5.6, 4.4, 6.8], [.5, .5, 0]], top: [[.5, 12, .001], [.5, 0, 0]] };
  const setView = seg(fig.querySelector('.seg'), v => { camera.position.set(...views[v][0]); controls.target.set(...views[v][1]); });
  camera.position.set(...views.tilt[0]); controls.target.set(...views.tilt[1]);

  function resize() {
    const w = cv.parentElement.clientWidth; if (w < 40) return;
    const h = Math.round(Math.min(460, Math.max(280, w * .62)));
    renderer.setSize(w, h, false); cv.style.height = h + 'px';
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(cv.parentElement); resize();
  zIn.oninput = update; aIn.oninput = update;
  fig.api = {
    set({ z, a, view } = {}) {
      if (a != null) aIn.value = a; if (z != null) zIn.value = z;
      if (view) { setView(view); camera.position.set(...views[view][0]); controls.target.set(...views[view][1]); }
      update(); flash(fig);
    },
  };
  update();
  renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
}
