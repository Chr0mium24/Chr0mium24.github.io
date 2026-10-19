// 图：first / after 游标分页。全是示例数据：23 条帖子，游标按 graphql-relay 的格式编（base64("arrayconnection:下标")），
// 真实服务端的游标长什么样都有可能，客户端只管原样传回去。
import { flash } from '/assets/fig.js';

export const TOTAL = 23;
export const POSTS = Array.from({ length: TOTAL }, (_, k) => ({ id: `post-${k + 1}`, likeCount: ((k + 1) * 7) % 11, commentCount: ((k + 1) * 5) % 13 }));
export const cursor = i => btoa(`arrayconnection:${i}`);
const fromCursor = c => +atob(c).split(':')[1];

// 假的服务端：和真接口返回同样形状的 posts 连接
export function serve(first, after, cFirst) {
  const start = after == null ? 0 : fromCursor(after) + 1, page = POSTS.slice(start, start + first), end = start + page.length - 1;
  return {
    totalCount: TOTAL,
    edges: page.map(p => ({ node: { ...p, comments: { totalCount: p.commentCount, shown: Math.min(cFirst, p.commentCount) } } })),
    pageInfo: { hasPreviousPage: start > 0, hasNextPage: end < TOTAL - 1, startCursor: page.length ? cursor(start) : null, endCursor: page.length ? cursor(end) : null },
    start,
  };
}

export default function mount(fig) {
  const inF = fig.querySelector('input[name=first]'), inC = fig.querySelector('input[name=cfirst]');
  const oF = fig.querySelector('output[for=first]'), oC = fig.querySelector('output[for=cfirst]');
  const strip = fig.querySelector('.strip'), req = fig.querySelector('.req'), res = fig.querySelector('.res'), out = fig.querySelector('.readout');
  const next = fig.querySelector('.btn.next'), reset = fig.querySelector('.btn.reset');
  const st = { first: 10, cFirst: 3, pages: [] };     // pages：每次请求的 { first, after, r }

  const last = () => st.pages[st.pages.length - 1];
  function request() {
    const after = last()?.r.pageInfo.endCursor ?? null;
    if (last() && !last().r.pageInfo.hasNextPage) return;
    st.pages.push({ first: st.first, cFirst: st.cFirst, after, r: serve(st.first, after, st.cFirst) });
    draw();
  }

  function draw() {
    oF.textContent = st.first; oC.textContent = st.cFirst; inF.value = st.first; inC.value = st.cFirst;
    const owner = Array(TOTAL).fill(-1);
    st.pages.forEach((p, i) => p.r.edges.forEach((_, j) => { owner[p.r.start + j] = i; }));
    strip.innerHTML = POSTS.map((p, k) => `<span class="${owner[k] < 0 ? '' : owner[k] % 2 ? 'b' : 'a'}${owner[k] === st.pages.length - 1 ? ' now' : ''}" title="${p.id}">${k + 1}</span>`).join('');
    const L = last(), after = L?.r.pageInfo.endCursor ?? null, done = L && !L.r.pageInfo.hasNextPage;
    // 下一次要发的请求
    req.innerHTML = done ? '<span class="dim">hasNextPage 是 false，没有下一页可请求了。</span>' : `<span class="k">POST</span> /graphql
{
  "operationName": "Posts",
  "variables": { …, "after": ${after ? `<b class="cur">"${after}"</b>` : 'null'} },
  "query": "query Posts(…) { posts(…, <b class="hot">first: ${st.first}</b>, after: $after) {
     … comments(<b class="hot">first: ${st.cFirst}</b>, order: RANK) { … } …"
}`;
    // 上一次拿回来的
    if (!L) res.innerHTML = '<span class="dim">还没请求。点“请求下一页”。</span>';
    else {
      const r = L.r;
      res.innerHTML = `"posts": {
  "totalCount": ${r.totalCount},
  "edges": [
${r.edges.map(e => `    { "node": { "id": "${e.node.id}", "likeCount": ${e.node.likeCount},\n      "comments": { "totalCount": ${e.node.comments.totalCount}, "edges": <span class="dim">[${e.node.comments.shown} 条]</span> } } }`).join(',\n') || '    <span class="dim">（空）</span>'}
  ],
  "pageInfo": { "hasNextPage": <b class="${r.pageInfo.hasNextPage ? 'ok' : ''}">${r.pageInfo.hasNextPage}</b>, "endCursor": <b class="cur">${r.pageInfo.endCursor ? `"${r.pageInfo.endCursor}"` : 'null'}</b> }
}`;
    }
    const got = owner.filter(x => x >= 0).length, cut = L ? L.r.edges.filter(e => e.node.comments.shown < e.node.comments.totalCount).length : 0;
    out.innerHTML = !L ? `一页 ${st.first} 条，翻完 ${TOTAL} 条要请求 <b>${Math.ceil(TOTAL / st.first)}</b> 次。`
      : `第 ${st.pages.length} 次请求拿到 ${L.r.edges.length} 条，累计 <b class="${done ? 'ok' : ''}">${got} / ${TOTAL}</b>。` +
        (done ? ' 翻完了。' : ` 下一次把 endCursor 原样填进 after。`) +
        (cut ? `<br>这一页有 ${cut} 条帖子的评论没给全：<code>comments(first: ${L.cFirst})</code> 只带前 ${L.cFirst} 条。` : '');
    next.disabled = !!done;
  }

  inF.addEventListener('input', () => { st.first = +inF.value; draw(); });
  inC.addEventListener('input', () => { st.cFirst = +inC.value; draw(); });
  next.addEventListener('click', request);
  reset.addEventListener('click', () => { st.pages = []; draw(); });
  fig.api = {
    set(o = {}) {
      if (o.first) st.first = o.first;
      if (o.cFirst != null) st.cFirst = o.cFirst;
      if (o.reset) st.pages = [];
      for (let i = 0; i < (o.pages || 0); i++) request();
      draw(); flash(fig);
    },
  };
  draw();
}
