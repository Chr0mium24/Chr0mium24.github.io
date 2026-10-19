#!/usr/bin/env python3
"""一次性导入（已经跑过）：把旧博客（Astro/Fuwari 版）里的文章搬进 site/。

来源两处，都从 git 里读，不依赖工作区：
  1. 提交 9e2c0f8「del all posts」删掉的 41 篇（从它的父提交里取）
  2. 分支 astro-legacy（迁移前的 main）里 src/content/posts/ 的文章
另外：astro-legacy 里 public/*.html 小工具拷到 site/tools/。

已经手工做成可交互的（或已有页面的）文章不覆盖，只把真实发布日期报出来。
生成：site/posts/<slug>/index.html，以及 /tmp/blog_import.json（清单，给 posts.js 用）。
用法：python3 scripts/import_repo_posts.py
"""
import json, re, subprocess, sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SITE = REPO / 'site'
LEGACY = 'astro-legacy'
DEL_COMMIT = '9e2c0f8'
DEAD_IMG = '106.55.6.119'

# 已经有页面的：仓库文件名 → 站点 slug
EXISTING = {
    'night-snack': 'yexiao', 'wake': 'shuixingle', 'ameri-visa': 'meiqian', 'flcl': 'flcl',
    'digital-circuit-game': 'logic', 'double-var-int': 'jacobian', 'group-tut': 'group',
    'lambda-calc': 'lambda', 'lib-sys-analysis': 'library', 'minecraft-high-tech-modpacks': 'modpacks',
}
SKIP_EMPTY = 20          # 正文少于这么多字的不导（比如只有标题的草稿）
ESSAY_CATS = {'随笔', '随想'}


def git(*args):
    return subprocess.run(['git', '-C', str(REPO), *args], capture_output=True, text=True, check=True).stdout


def git_bytes(spec):
    r = subprocess.run(['git', '-C', str(REPO), 'show', spec], capture_output=True)
    return r.stdout if r.returncode == 0 else None


def sources():
    out = []
    for path in git('show', '--name-only', '--format=', DEL_COMMIT).split():
        if path.endswith('.md'):
            out.append((Path(path).stem, git('show', f'{DEL_COMMIT}^:{path}'), f'{DEL_COMMIT}（del all posts）之前的 {path}', None))
    for path in git('ls-tree', '--name-only', f'{LEGACY}:src/content/posts').split():
        if path.endswith('.md'):
            out.append((Path(path).stem, git('show', f'{LEGACY}:src/content/posts/{path}'), f'迁移前 main（{LEGACY} 分支）的 src/content/posts/{path}', f'{LEGACY}:src/content/posts/'))
    return out


def frontmatter(text):
    m = re.match(r'---\n(.*?)\n---\n?(.*)', text, re.S)
    if not m:
        return {}, text
    fm = {}
    for line in m.group(1).splitlines():
        k, _, v = line.partition(':')
        if _:
            fm[k.strip()] = v.strip().strip('"\'')
    return fm, m.group(2)


def to_html(md, title, asset_dir, out_dir):
    md = md.replace('<!-- more -->', '')
    md = re.sub(rf'^#\s+{re.escape(title)}.*$', '', md, count=1, flags=re.M)     # 正文开头重复的标题
    shift = ['--shift-heading-level-by=1'] if re.search(r'^# ', md, re.M) else []   # 正文里用 # 当小节的，整体降一级
    html = subprocess.run(['pandoc', '-f', 'gfm+tex_math_dollars', '-t', 'html', '--mathjax', '--wrap=none', *shift],
                          input=md, capture_output=True, text=True, check=True).stdout

    # 图片：旧图床的换成占位；本地图片拷过来
    def img(m):
        tag = m.group(0)
        src = re.search(r'src="([^"]+)"', tag).group(1)
        alt = (re.search(r'alt="([^"]*)"', tag) or [None, ''])[1]
        if DEAD_IMG in src:
            return f'<span class="ph" style="display:block"><span class="ph-img" style="display:grid;aspect-ratio:4/3"></span></span>'
        if not src.startswith(('http:', 'https:', 'data:')) and asset_dir:
            name = Path(src).name
            data = git_bytes(asset_dir + name)
            if data:
                (out_dir / name).write_bytes(data)
                return tag.replace(src, name)
        return tag
    html = re.sub(r'<img [^>]*>', img, html)
    html = re.sub(r'<figcaption[^>]*>[0-9a-f]{20,}[^<]*</figcaption>', '', html)       # 旧图床文件名当说明的去掉
    # 表格：5 列以上的撑宽到图的宽度，再不够就横向滚
    def table(m):
        cols = len(re.findall(r'<th[ >]', m.group(0).split('</tr>')[0]))
        return f'<div class="table-wrap{" wide" if cols >= 5 else ""}">{m.group(0)}</div>'
    html = re.sub(r'<table>.*?</table>', table, html, flags=re.S)
    return html.strip()


PAGE = '''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} · 某某</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont/lxgwwenkaigbscreen.css">
{katex}<link rel="stylesheet" href="/assets/site.css">
<script type="module" src="/assets/page.js"></script>
</head>
<body>
<header class="site"><a class="name" href="/">某某</a><nav><a href="/#essays"{cur_e}>随笔</a><a href="/#notes"{cur_n}>笔记</a><a href="/#tools">小工具</a></nav></header>
<main class="post">
  <div class="kicker"><span>{kind}</span><span>{date}</span>{ai}</div>
  <h1>{title}</h1>
{dek}{body}
  <p class="src">原文：Chr0mium24/Blog 仓库，{src}</p>
</main>
<footer class="site"><a href="/">← 首页</a><span>某某</span><span></span></footer>
</body>
</html>
'''
KATEX = '''<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
'''


def main():
    report = {'texts': [], 'docs': [], 'existing': [], 'skipped': [], 'tools': []}
    for stem, text, src, asset_dir in sources():
        fm, md = frontmatter(text)
        title, date, cat = fm.get('title', stem), fm.get('published', '')[:10], fm.get('category', '') or '杂'
        ai = fm.get('ai', '').lower() == 'true'
        if stem in EXISTING:
            report['existing'].append({'slug': EXISTING[stem], 'from': stem, 'date': date, 'ai': ai, 'title': title})
            continue
        if len(re.sub(r'\s', '', md)) < SKIP_EMPTY:
            report['skipped'].append({'from': stem, 'title': title, 'why': '正文是空的'})
            continue
        repost = title.startswith('转载')
        essay = cat in ESSAY_CATS
        kind = '转载' if repost else cat
        out_dir = SITE / 'posts' / stem
        out_dir.mkdir(parents=True, exist_ok=True)
        body = to_html(md, title, asset_dir, out_dir)
        if essay:
            body = f'  <div class="essay">\n{body}\n  </div>'
        desc = fm.get('description', '')
        page = PAGE.format(
            title=title.replace('转载：', ''), date=date, kind=kind, src=src, body=body,
            katex=KATEX if 'math inline' in body or 'math display' in body else '',
            ai=' <span class="ai">AI 生成</span>' if ai else '',
            dek=f'  <p class="dek">{desc}</p>\n' if desc else '',
            cur_e=' aria-current="page"' if essay else '', cur_n='' if essay else ' aria-current="page"')
        (out_dir / 'index.html').write_text(page, encoding='utf-8')
        chars = len(re.sub(r'<[^>]+>|\s', '', body))
        entry = {'slug': stem, 'title': title.replace('转载：', ''), 'date': date, 'kind': kind, 'ai': ai, 'chars': chars,
                 'code': body.count('<pre'), 'math': body.count('class="math')}
        report['texts' if essay else 'docs'].append(entry)

    tools_dir = SITE / 'tools'
    tools_dir.mkdir(exist_ok=True)
    for name in git('ls-tree', '--name-only', f'{LEGACY}:public').split():
        if not name.endswith('.html'):
            continue
        data = git_bytes(f'{LEGACY}:public/{name}')
        (tools_dir / name).write_bytes(data)
        t = re.search(r'<title>([^<]*)</title>', data.decode('utf-8', errors='ignore'))
        report['tools'].append({'file': name, 'title': t.group(1).strip() if t else Path(name).stem})

    Path('/tmp/blog_import.json').write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding='utf-8')
    for k, v in report.items():
        print(f'{k}: {len(v)}')


if __name__ == '__main__':
    sys.exit(main())
