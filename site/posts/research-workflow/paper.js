// 三遍读法共用的数据：一篇三页的论文版面，和每一遍读哪些块、花多久。
// 图 1（passes.js）和首页小图（mini.js）都用这里画页面。

// 每页的块：x, y, w, h 按页宽为 1、页高为 1.32 的比例给
export const PAGES = [
  [
    { k: 'title', x: .12, y: .07, w: .76, h: .07 },
    { k: 'title', x: .28, y: .16, w: .44, h: .025 },
    { k: 'abstract', x: .14, y: .21, w: .72, h: .17 },
    { k: 'head', x: .08, y: .43, w: .3, h: .03 },
    { k: 'intro', x: .08, y: .48, w: .84, h: .3 },
    { k: 'head', x: .08, y: .83, w: .4, h: .03 },
    { k: 'body', x: .08, y: .88, w: .84, h: .36 },
  ],
  [
    { k: 'head', x: .08, y: .07, w: .3, h: .03 },
    { k: 'body', x: .08, y: .12, w: .84, h: .15 },
    { k: 'eq', x: .2, y: .3, w: .6, h: .05 },
    { k: 'body', x: .08, y: .38, w: .84, h: .12 },
    { k: 'eq', x: .26, y: .53, w: .48, h: .05 },
    { k: 'fig', x: .12, y: .62, w: .76, h: .3 },
    { k: 'head', x: .08, y: .97, w: .34, h: .03 },
    { k: 'body', x: .08, y: 1.02, w: .84, h: .22 },
  ],
  [
    { k: 'table', x: .1, y: .07, w: .8, h: .2 },
    { k: 'fig', x: .12, y: .31, w: .76, h: .25 },
    { k: 'body', x: .08, y: .6, w: .84, h: .1 },
    { k: 'head', x: .08, y: .74, w: .3, h: .03 },
    { k: 'concl', x: .08, y: .79, w: .84, h: .14 },
    { k: 'refs', x: .08, y: .97, w: .84, h: .27 },
  ],
];
export const PAGE_H = 1.32;

export const KINDS = {
  title: '标题和作者', abstract: '摘要', intro: '引言', head: '章节标题', body: '正文',
  eq: '公式和推导', fig: '图', table: '表', concl: '结论', refs: '参考文献',
};

// 每一遍：读哪些块（按顺序）、花多久（分钟）、读完该能回答什么
export const PASSES = [
  {
    name: '第一遍', t: [5, 10], time: '5–10 分钟', goal: '鸟瞰全貌，判断值不值得读下去',
    order: ['title', 'abstract', 'intro', 'head', 'concl', 'refs'],
    out: '能回答五个 C：<b>类别</b>（新方法？分析已有系统？）、<b>背景</b>（解决什么问题、和谁相关）、<b>正确性</b>（假设看着合理吗）、<b>贡献</b>（最主要的一条）、<b>清晰度</b>（写得好懂吗）。然后决定：放下，还是读第二遍。',
    note: {
      title: '先知道它在说什么、是谁写的。',
      abstract: '作者自己写的一段总结，读完大概能猜出类别和贡献。',
      intro: '仔细读：问题是什么、为什么重要、和哪些工作有关。',
      head: '只看章节和小节的标题，不看正文，先把文章的骨架记下来。',
      concl: '直接跳到结论，看作者自己说做成了什么。',
      refs: '扫一眼：有没有你认识的作者和论文。',
      body: '这一遍跳过。', eq: '这一遍跳过。', fig: '这一遍跳过。', table: '这一遍跳过。',
    },
  },
  {
    name: '第二遍', t: [50, 70], time: '约 1 小时', goal: '掌握内容，忽略细节',
    order: ['fig', 'table', 'body', 'refs'],
    out: '能向领域外的人讲清楚这篇的<b>主要观点、论证过程和核心发现</b>。和你相关但不是核心的论文，读到这里通常就够了。',
    note: {
      fig: '仔细看图：坐标轴标了什么、有没有误差棒、和谁对比。研究严不严谨，从这里就看得出来。',
      table: '和图一样，看清比的是什么、在什么条件下比。',
      body: '通读，抓主要论点；拿笔在页边写问题、写一句话总结、给关键想法打星号。不要只划荧光笔。',
      refs: '标出没读过、但看起来重要的那几篇，它们就是下一批要找的资料。',
      eq: '公式和证明先跳过，知道它在算什么就行。',
      title: '第一遍读过了。', abstract: '第一遍读过了。', intro: '第一遍读过了。', head: '第一遍读过了。', concl: '第一遍读过了。',
    },
  },
  {
    name: '第三遍', t: [60, 300], time: '1–5 小时', goal: '深入理解，虚拟重现',
    order: ['intro', 'body', 'eq', 'fig', 'table', 'concl'],
    out: '能<b>凭记忆重建</b>整篇论文的结构，指出它的优点和缺陷，说清它在整个知识体系里的位置；顺手记下冒出来的新想法。',
    note: {
      intro: '设身处地：假如你是作者，从同一个问题出发，你会怎么做？',
      body: '挑战假设：每个论断都问一句“凭什么”，找出没写明的前提。',
      eq: '自己推一遍，再和作者的推导对比。差别在哪，创新点和漏洞就在哪。',
      fig: '想想你会怎么设计这个实验、画这张图；数据够不够撑起结论，有没有别的解读？',
      table: '同上：换你来做实验，这张表会长什么样？',
      concl: '对比反思：你“重现”的版本和论文差在哪？把冒出来的新想法记下来。',
      title: '第一遍读过了。', abstract: '第一遍读过了。', head: '第一遍读过了。', refs: '能把它放进整个文献脉络里了。',
    },
  },
];

// 某一遍里，这个块是什么状态：now = 这一遍在读，done = 之前读过，no = 还没读
export function status(pass, k) {
  if (PASSES[pass].order.includes(k)) return 'now';
  for (let i = 0; i < pass; i++) if (PASSES[i].order.includes(k)) return 'done';
  return 'no';
}

// 在 box 里排三页，返回每个块在画布上的矩形（给点选用）
export function layout(box, gap = 10) {
  const pw = Math.min((box.w - gap * 2) / 3, box.h / PAGE_H), ph = pw * PAGE_H;
  const x0 = box.x + (box.w - (pw * 3 + gap * 2)) / 2;
  const rects = [];
  PAGES.forEach((pg, i) => {
    const px = x0 + i * (pw + gap), py = box.y;
    pg.forEach(b => rects.push({ k: b.k, page: i, x: px + b.x * pw, y: py + b.y * pw, w: b.w * pw, h: b.h * pw }));
  });
  return { pw, ph, x0, gap, rects };
}

const alpha = (ctx, a, f) => { const o = ctx.globalAlpha; ctx.globalAlpha = a; f(); ctx.globalAlpha = o; };

// 画三页：pass = 0/1/2，sel = 选中的块种类（红框）
export function drawPages(ctx, P, box, pass, sel, gap) {
  const L = layout(box, gap), { pw, ph, x0 } = L;
  for (let i = 0; i < 3; i++) {
    const px = x0 + i * (pw + L.gap);
    ctx.fillStyle = '#fff'; ctx.fillRect(px, box.y, pw, ph);
    ctx.strokeStyle = P.mute; ctx.lineWidth = 1; ctx.strokeRect(px + .5, box.y + .5, pw - 1, ph - 1);
  }
  const lh = Math.max(3, pw / 34);
  L.rects.forEach(r => {
    const s = status(pass, r.k), col = s === 'now' ? P.ok : s === 'done' ? P.ref : P.mute, a = s === 'no' ? .28 : s === 'done' ? .55 : .95;
    if (s === 'now') alpha(ctx, .1, () => { ctx.fillStyle = P.ok; ctx.fillRect(r.x - 2, r.y - 2, r.w + 4, r.h + 4); });
    ctx.strokeStyle = col; ctx.fillStyle = col;
    alpha(ctx, a, () => drawBlock(ctx, r, lh));
  });
  // 第二遍起：页边的批注
  if (pass >= 1) {
    ctx.fillStyle = P.ink; ctx.font = `${Math.max(8, pw / 14)}px ${P.font.split('px')[1] || 'sans-serif'}`; ctx.textAlign = 'center';
    L.rects.filter(r => r.k === 'body' || r.k === 'fig').forEach((r, j) => alpha(ctx, .55, () => ctx.fillText(['?', '*', '✓', '?', '*', '!'][j % 6], r.x + r.w + (pw * .04), r.y + Math.min(r.h, 14))));
  }
  if (sel) L.rects.filter(r => r.k === sel).forEach(r => {
    ctx.strokeStyle = P.hand; ctx.lineWidth = 2; ctx.strokeRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6); ctx.lineWidth = 1;
  });
  return L;
}

function drawBlock(ctx, r, lh) {
  const lines = (x, y, w, h, last = .6) => {
    const n = Math.max(1, Math.floor(h / (lh * 1.7)));
    for (let i = 0; i < n; i++) ctx.fillRect(x, y + i * lh * 1.7, i === n - 1 && n > 1 ? w * last : w, Math.max(1, lh * .55));
  };
  switch (r.k) {
    case 'title': { const n = r.h > lh * 2.5 ? 2 : 1; for (let i = 0; i < n; i++) ctx.fillRect(r.x + (i ? r.w * .15 : 0), r.y + i * r.h / 2, i ? r.w * .7 : r.w, Math.max(1.5, r.h / (n * 2.2))); break; }
    case 'abstract': ctx.fillRect(r.x, r.y, 1.5, r.h); lines(r.x + lh, r.y + 1, r.w - lh, r.h); break;
    case 'head': ctx.fillRect(r.x, r.y, r.w, Math.max(2, r.h * .8)); break;
    case 'eq': {
      ctx.fillRect(r.x, r.y + r.h * .35, r.w * .8, Math.max(1.5, r.h * .3));
      ctx.beginPath(); ctx.arc(r.x + r.w * .93, r.y + r.h * .5, Math.max(1.5, r.h * .25), 0, 7); ctx.stroke(); break;
    }
    case 'fig': {
      ctx.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1);
      const ix = r.x + r.w * .12, iy = r.y + r.h * .12, iw = r.w * .78, ih = r.h * .7;
      ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ix, iy + ih); ctx.lineTo(ix + iw, iy + ih); ctx.stroke();
      ctx.beginPath(); for (let i = 0; i <= 12; i++) { const t = i / 12, y = iy + ih * (.85 - .6 * t + .12 * Math.sin(t * 9)); i ? ctx.lineTo(ix + iw * t, y) : ctx.moveTo(ix, y); } ctx.stroke();
      for (let i = 1; i < 6; i++) { const t = i / 6, y = iy + ih * (.82 - .6 * t + .12 * Math.sin(t * 9)); ctx.fillRect(ix + iw * t - .5, y - ih * .08, 1, ih * .16); }
      break;
    }
    case 'table': {
      ctx.fillRect(r.x, r.y, r.w, 1.5); ctx.fillRect(r.x, r.y + r.h * .22, r.w, 1); ctx.fillRect(r.x, r.y + r.h - 1.5, r.w, 1.5);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) ctx.fillRect(r.x + r.w * (.04 + j * .25), r.y + r.h * (.36 + i * .22), r.w * .16, Math.max(1, lh * .55));
      break;
    }
    case 'refs': {
      ctx.fillRect(r.x, r.y, r.w * .35, Math.max(2, lh * .8));
      const n = Math.max(2, Math.floor((r.h - lh * 2) / (lh * 1.5)));
      for (let i = 0; i < n; i++) { const y = r.y + lh * 2.2 + i * lh * 1.5; ctx.fillRect(r.x, y, r.w * .06, Math.max(1, lh * .5)); ctx.fillRect(r.x + r.w * .1, y, r.w * (.55 + .3 * ((i * 37) % 10) / 10), Math.max(1, lh * .5)); }
      break;
    }
    default: lines(r.x, r.y, r.w, r.h);
  }
}
