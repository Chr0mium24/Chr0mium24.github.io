# Blog

手写的静态博客，部署在 <https://chr0mium.link>。没有构建步骤：`site/` 里是什么，线上就是什么。

旧的 Astro（Fuwari）版本完整保留在分支 [`astro-legacy`](https://github.com/Chr0mium24/Blog/tree/astro-legacy)。

## 目录

```
site/
  index.html            首页：能玩的笔记卡片、其余笔记、小工具、随笔
  404.html              找不到的页面；旧博客的地址在这里跳到新地址
  assets/
    site.css            全部样式。规则只有一条：红色 = 能动
    page.js             每页都引：挂图、正文里的“试试”按钮、首页小图、公式、上一篇/下一篇
    fig.js              画图的小工具（颜色从 CSS 变量读、高清 canvas、拖拽）
    posts.js            文章清单，首页和上一篇/下一篇都从这里来
    home.js             首页
  posts/<slug>/
    index.html          一篇文章
    *.js                这篇的交互图（export default function (figure) {…}）
    mini.js             首页卡片上的小图（只有能玩的笔记有）
  tools/                单页小工具（原来在根目录），thumbs/ 是首页缩略图
scripts/
  serve.py              本地预览（不缓存）
  import_repo_posts.py  一次性：把旧博客的文章导进来（已经跑过）
```

## 本地预览

```bash
python3 scripts/serve.py 8774 site
```

然后打开 <http://localhost:8774>。

## 加一篇文章

1. 复制一个 `site/posts/<slug>/` 文件夹改内容。随笔用 `<div class="essay">` 包正文；有公式的页面在 `<head>` 里引 KaTeX（照抄别的页面）。
2. 要交互图：写 `site/posts/<slug>/图.js`，在正文里放 `<figure class="play wide" data-fig="./图.js">`。图的模块要给 `figure.api.set(obj)`，正文里的 `<button class="try" data-set='{…}'>` 会调它。
3. 在 `site/assets/posts.js` 里加一行：能玩的放 `NOTES`（要有 `mini.js`），其余笔记放 `DOCS`，随笔放 `TEXTS`。
4. push 到 `main`，GitHub Actions 会把 `site/` 发出去。
