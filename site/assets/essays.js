// 随笔摘录：从随笔页面里取正文。短的整篇放，长的切一刀，老实写还剩多少。首页和随笔栏共用。
const len = el => el.textContent.replace(/\s/g, '').length;

export async function fillEssay(box, p, { cut = true } = {}) {
  try {
    const html = await (await fetch(`/posts/${p.slug}/`)).text();
    const src = new DOMParser().parseFromString(html, 'text/html').querySelector('.essay');
    const kids = [...src.children];
    const total = kids.reduce((n, k) => n + len(k), 0);
    let keep = kids, more = '';
    if (cut && p.kind === '攻略') {
      keep = kids.slice(0, 1);
      more = `✂ 还有 ${src.querySelectorAll(':scope > ol > li').length} 条`;
    } else if (cut && total > 320 && total - len(kids[0]) >= 100) {
      keep = kids.slice(0, 1);
      more = `✂ 还有 ${((total - len(kids[0])) / 1000).toFixed(1)}k 字`;
    }
    box.append(...keep.map(k => document.importNode(k, true)));
    if (more) box.insertAdjacentHTML('beforeend', `<a class="cut" href="/posts/${p.slug}/">${more}</a>`);
  } catch { box.innerHTML = `<p><a href="/posts/${p.slug}/">去看正文</a></p>`; }
}

export const essayShell = (p, md) => `<article id="e-${p.slug}"><div class="d"><time>${md(p.date)}</time><span>${p.kind}</span></div><h3><a href="/posts/${p.slug}/">${p.title}</a></h3><div class="essay"></div></article>`;
