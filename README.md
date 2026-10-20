# Blog

手写的静态博客，部署在 <https://chr0mium.link>。没有构建步骤：`site/` 里是什么，线上就是什么。

旧的 Astro（Fuwari）版本完整保留在分支 [`astro-legacy`](https://github.com/Chr0mium24/Chr0mium24.github.io/tree/astro-legacy)。

## 目录

```
site/
  index.html            首页：速查公告栏、最近三篇、文章/随笔/工具页签
  articles/ essays/ notes/ tools/ archive/   五个栏目页（内容都从 assets/posts.js 来）
  404.html              找不到的页面；旧地址（旧博客、改版前的 slug）在这里跳到新地址
  assets/
    site.css            全部样式。规则只有一条：红色 = 能动
    posts.js            清单：ARTICLES / TEXTS / NOTES（速查）/ TOOLS / ARCHIVED_TOOLS
    page.js             每页都引：挂图、正文里的“试试”按钮、首页小图、公式、上一篇/下一篇
    fig.js              画图的小工具（颜色从 CSS 变量读、高清 canvas、拖拽、tween、plot）
    home.js sections.js essays.js   首页、栏目页、随笔摘录
    board.js            速查公告栏和弹窗（短的浮窗，长的右侧抽屉）
    runner.js           可运行的 Python 代码格（点了才加载 Pyodide）
    steps.js            步骤/分支走查组件
  posts/<slug>/         文章和随笔：index.html、这篇的交互图 *.js、首页小图 mini.js
  notes/<slug>/         速查：正文和图都包在 .note-body 里，会被搬进首页弹窗
  tools/                cec-tool.html 和归档的旧工具
scripts/
  serve.py              本地预览（不缓存，找不到的页面返回 404.html）
```

## 本地预览

```bash
python3 scripts/serve.py 8774 site
```

然后打开 <http://localhost:8774>。

## 加一篇文章

1. 复制一个 `site/posts/<slug>/` 文件夹改内容。随笔用 `<div class="essay">` 包正文；有公式的页面在 `<head>` 里引 KaTeX（照抄别的页面）。
2. 要交互图：写 `site/posts/<slug>/图.js`，在正文里放 `<figure class="play wide" data-fig="./图.js">`。图的模块要给 `figure.api.set(obj)`，正文里的 `<button class="try" data-set='{…}'>` 会调它。
3. 在 `site/assets/posts.js` 里加一行：文章放 `ARTICLES`（有 `mini.js` 就写 `mini: true`），随笔放 `TEXTS`，速查放 `NOTES`（页面在 `site/notes/<slug>/`，`size: 'short' | 'long'` 决定浮窗还是抽屉）。
4. push 到 `main`，GitHub Actions 会把 `site/` 发出去。
