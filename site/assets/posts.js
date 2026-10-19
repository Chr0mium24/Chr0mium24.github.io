// 文章清单：首页从这里排。加一篇文章 = 在这里加一行。

// 能玩的：mini 是首页小图的模块，q 是这篇回答的问题，act 是“能动什么”
export const NOTES = [
  { slug: 'jia1', title: "夹 1 法则", date: '2026-09-08', tag: '信号与系统', q: "几个极点，问 DTFT 存不存在：ROC 是哪一段？", act: "拖极点" },
  { slug: 'geo', title: "1/(1−az⁻¹) 从哪来", date: '2026-09-08', tag: '信号与系统', q: "等比级数什么时候收敛？出了 ROC，闭式还给你一个数。", act: "拖 z，看部分和" },
  { slug: 'modpacks', title: "Minecraft 高版本科技包", date: '2026-09-07', tag: '游戏', q: "按版本线、模组数、要不要中文任务书，把 22 个整合包筛一遍。", act: "点条件筛包", ai: true },
  { slug: 'jacobian', title: "二元函数积分换元", date: '2025-04-07', tag: '数学', q: "为什么 dx dy = r dr dθ？小方格被拉成了扇形。", act: "拖小格子" },
  { slug: 'group', title: "群论的一些资料", date: '2025-04-05', tag: '数学', q: "正方形有 8 种对称，转和翻怎么复合？", act: "点“转”和“翻”" },
  { slug: 'library', title: "某图书管理系统的分析", date: '2025-04-01', tag: '编程', q: "接口给的是毫秒时间戳，几点哪间房空着？", act: "拖时间线" },
  { slug: 'logic', title: "数电小游戏", date: '2025-03-22', tag: '数电', q: "只有一种 NAND 门，怎么搭出 NOT、AND、OR、XOR？", act: "点输入开关" },
  { slug: 'lambda', title: "Lambda初窥", date: '2025-03-13', tag: '编程', q: "只用函数写数字：n 就是“把 f 用 n 次”。", act: "换 n，看 f 用几次" },
].map(p => ({ ...p, mini: `/posts/${p.slug}/mini.js` }));

// 其余笔记（还没做成能玩的）：从旧仓库导入，tag 是原来的 category
export const DOCS = [
  {"slug": "behavior-floor-pricing", "title": "下限是被定价出来的", "date": "2026-09-08", "tag": "知识", "size": "约 10.1k 字", "ai": true},
  {"slug": "kf-and-lqr", "title": "LQR与卡尔曼滤波的同构(草稿)", "date": "2026-04-19", "tag": "知识", "size": "约 3.3k 字"},
  {"slug": "macos-window-shortcuts", "title": "MacOS自定义快捷键打开窗口", "date": "2026-04-16", "tag": "经验", "size": "约 1.4k 字"},
  {"slug": "bangbang-control", "title": "滑模控制", "date": "2026-04-14", "tag": "知识", "size": "约 2.2k 字"},
  {"slug": "mac-shortcuts", "title": "mac常用快捷键整理", "date": "2026-03-24", "tag": "经验", "size": "937 字"},
  {"slug": "skills-and-mcp-install", "title": "skills and mcp install", "date": "2026-03-24", "tag": "杂", "size": "362 字"},
  {"slug": "python-basic", "title": "Python入门", "date": "2026-03-22", "tag": "知识", "size": "1 段代码"},
  {"slug": "research-drawing", "title": "科研绘图", "date": "2026-03-20", "tag": "经验", "size": "584 字"},
  {"slug": "vibe-coding", "title": "Vibe coding的经验总结", "date": "2026-03-20", "tag": "经验", "size": "约 2.0k 字"},
  {"slug": "win11-reinstall", "title": "Win11重装工具", "date": "2026-01-23", "tag": "工具", "size": "约 2.2k 字"},
  {"slug": "python-class-and-attribute", "title": "Python的类和属性", "date": "2025-12-07", "tag": "代码", "size": "约 2.5k 字"},
  {"slug": "windows-beautify", "title": "windows美化&小工具", "date": "2025-10-27", "tag": "折腾", "size": "181 字"},
  {"slug": "pyscript-micropip-issue", "title": "pyscript包管理踩坑", "date": "2025-09-30", "tag": "代码", "size": "1 段代码"},
  {"slug": "gfn-lec3", "title": "gfn lec3", "date": "2025-09-26", "tag": "学习", "size": "约 3.8k 字"},
  {"slug": "gfnlec4", "title": "GFNLec4", "date": "2025-09-26", "tag": "学习", "size": "约 2.9k 字"},
  {"slug": "lcapy", "title": "lcapy中设置受控源", "date": "2025-09-26", "tag": "代码", "size": "约 3.0k 字"},
  {"slug": "macos-install-silksong-mod", "title": "丝之歌mod和辅助网站", "date": "2025-09-15", "tag": "游戏", "size": "约 1.3k 字"},
  {"slug": "rm-oct-task", "title": "rm10月工作", "date": "2025-09-13", "tag": "学习", "size": "约 3.4k 字"},
  {"slug": "gfn-lec2", "title": "gfn-lec2", "date": "2025-09-12", "tag": "学习", "size": "约 2.3k 字"},
  {"slug": "linear-regression-discussion", "title": "水群看到的线性回归的理解", "date": "2025-09-12", "tag": "学习", "size": "约 2.1k 字"},
  {"slug": "macbook-from-windows-to-macos", "title": "把Windows系统换回MacOS", "date": "2025-09-06", "tag": "折腾", "size": "609 字"},
  {"slug": "gfn-lec1", "title": "GFN Lec1", "date": "2025-09-05", "tag": "学习", "size": "约 4.1k 字"},
  {"slug": "guide-to-graduate-admission", "title": "ECE升学指引", "date": "2025-09-03", "tag": "学业", "size": "约 4.3k 字"},
  {"slug": "how-to-read-paper", "title": "how to read paper", "date": "2025-09-02", "tag": "学习", "size": "约 2.7k 字"},
  {"slug": "verilog-tut", "title": "verilog入门", "date": "2025-09-02", "tag": "学习", "size": "约 3.0k 字"},
  {"slug": "course-evaluate", "title": "lgu课程评价", "date": "2025-09-01", "tag": "学习", "size": "499 字"},
  {"slug": "a00-car", "title": "A00小车", "date": "2025-08-27", "tag": "生活", "size": "991 字"},
  {"slug": "excel-eval-formula", "title": "Excel计算单元格中算式", "date": "2025-08-20", "tag": "Excel", "size": "566 字"},
  {"slug": "kayuan", "title": "卡园客户端", "date": "2025-04-10", "tag": "代码", "size": "约 2.0k 字"},
  {"slug": "python-script-calc-filename-sum", "title": "发票统计金额的python脚本", "date": "2025-04-09", "tag": "代码", "size": "1 段代码"},
  {"slug": "vanblog-build-process", "title": "重新部署vanBlog博客可能需要的流程", "date": "2025-04-09", "tag": "代码", "size": "2 段代码"},
  {"slug": "first-two-year-study-plan", "title": "大学前两年，如何规划才能不留遗憾 ——汤圆", "date": "2025-03-29", "tag": "学业", "size": "约 3.5k 字"},
  {"slug": "how-to-find-ted-transcript", "title": "TED视频字幕怎么找", "date": "2025-02-02", "tag": "学习", "size": "38 字"},
];

// 文字的（随笔、随想、转载、观后感、照片、攻略）：首页直接把正文摆出来，正文从各自页面里读
export const TEXTS = [
  {"slug": "sign-language", "title": "从“虾线男朋友”到威廉·福克纳：语言的物理性与思维的原生状态", "date": "2025-11-24", "kind": "随想"},
  {"slug": "leaving-yale", "title": "别耶鲁", "date": "2025-08-02", "kind": "随笔"},
  {"slug": "doro-and-railway-station", "title": "Doro和火车站台", "date": "2025-05-26", "kind": "转载"},
  {"slug": "cake", "title": "蛋糕", "date": "2025-05-02", "kind": "随笔"},
  {"slug": "grey-product", "title": "为什么做灰产会比大部分正规行业赚得更多", "date": "2025-04-25", "kind": "转载"},
  {"slug": "blue-hour", "title": "蓝调时刻", "date": "2025-04-10", "kind": "随笔"},
  {"slug": "meiqian", "title": "美签总结", "date": "2025-04-08", "kind": "攻略"},
  {"slug": "yexiao", "title": "夜宵", "date": "2025-04-07", "kind": "随笔"},
  {"slug": "shuixingle", "title": "睡醒了", "date": "2025-04-06", "kind": "随笔"},
  {"slug": "flcl", "title": "FLCL(fooly cooly)", "date": "2025-04-05", "kind": "观后感"},
  {"slug": "xiaoniao", "title": "小鸟", "date": "2025-04-03", "kind": "照片"},
  {"slug": "bing", "title": "溜大了", "date": "2025-02-25", "kind": "随笔"},
  {"slug": "you-wake-up", "title": "wake up", "date": "2025-02-20", "kind": "随笔"},
  {"slug": "summer", "title": "夏", "date": "2025-01-04", "kind": "随笔"},
];

// 小工具：旧仓库 public/ 里的单页 HTML，原样放在 /tools/，缩略图在 /tools/thumbs/
export const TOOLS = [
  {"file": "camera.html", "title": "Steel Ball Camera"},
  {"file": "cec-tool.html", "title": "CEC 工具 (时间同步版)"},
  {"file": "classtable.html", "title": "Class Schedule Pro"},
  {"file": "color-recognize.html", "title": "图片颜色识别"},
  {"file": "conflict_viewer.html", "title": "冲突回顾"},
  {"file": "deepseek-usage-analyzer.html", "title": "DeepSeek API 用量分析与涨价预估"},
  {"file": "field-map-measure.html", "title": "210cm 场地测距地图"},
  {"file": "label-chat.html", "title": "Label Chat — AI 标签排版（纯前端版）"},
  {"file": "markdown_a4_studio.html", "title": "Markdown A4 Studio"},
  {"file": "pdf-split.html", "title": "PDF 超清切分与空白切除工具"},
  {"file": "pnp-test.html", "title": "手机 PnP 路标定位"},
  {"file": "resume-generator.html", "title": "Resume Builder"},
  {"file": "segment.html", "title": "JLC 轮廓标注器"},
  {"file": "skycode.html", "title": "Sky Code"},
  {"file": "timer.html", "title": "极简倒计时"},
];
