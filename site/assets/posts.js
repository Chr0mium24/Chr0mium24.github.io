// 全站清单：首页和各栏目页都从这里排。加一篇 = 在对应的数组里加一行。

// 文章：讲东西的长文。mini 表示有首页小图（/posts/<slug>/mini.js）。按日期从新到旧。
export const ARTICLES = [
  { slug: 'roc', title: "z 变换在哪里才算数", date: '2026-09-08', topic: '信号与系统', dek: "同一个分式可以是好几个序列的 z 变换。收敛域说清它是哪一个，也决定 DTFT 存不存在。", mini: true },
  { slug: 'floor-pricing', title: "下限是被定价出来的", date: '2026-09-08', topic: '经济', dek: "明知有害还照做，约束行为的不是道德，而是三个数：省下多少钱、被查的概率、查到了罚多重。", mini: true, ai: true },
  { slug: 'modpacks', title: "Minecraft 高版本科技包", date: '2026-09-07', topic: '游戏', dek: "按版本线、模组数、要不要中文任务书，把 22 个整合包筛一遍。", mini: true, ai: true },
  { slug: 'kf-lqr', title: "LQR 与卡尔曼滤波是同一个方程", date: '2026-04-19', topic: '控制', dek: "一个估计状态，一个设计控制。推到底是同一个 Riccati 递推，一个往前算，一个往后算。", mini: true },
  { slug: 'toggle-app', title: "一键开关窗口：从 AppleScript 到 Swift", date: '2026-04-16', topic: '工程', dek: "按一个快捷键：App 在前台就藏起来，不在前台就叫出来。为什么脚本版要等快一秒，换成 Swift 就几乎瞬间？", mini: true },
  { slug: 'sliding-mode', title: "从 Bang-bang 到滑模", date: '2026-04-14', topic: '控制', dek: "开关控制又快又硬，代价是抖。滞环、边界层和后来的几种滑模，各拿什么换掉了抖振？", mini: true },
  { slug: 'research-workflow', title: "科研工作流：读论文、找资料、画图", date: '2026-03-20', topic: '研究', dek: "论文分三遍读，资料顺着引用找，图和计算分成两个脚本。", mini: true },
  { slug: 'vibe-coding', title: "Vibe coding 的经验总结", date: '2026-03-20', topic: '经验', dek: "让 AI 变好用，就是给它更“对”的信息。" },
  { slug: 'python-objects', title: "Python 的对象模型：类、type 和元类", date: '2025-12-07', topic: 'Python', dek: "class 语句背后是谁在造类？obj.x 又是按什么顺序找到的？", mini: true },
  { slug: 'pyodide', title: "在浏览器里跑 Python", date: '2025-09-30', topic: 'Python', dek: "micropip 报“找不到纯 Python 3 wheel”的时候，到底卡在哪个包上？", mini: true },
  { slug: 'controlled-sources', title: "四种受控源", date: '2025-09-26', topic: '电路', dek: "输出由电路里另一处的电压或电流决定：E、G、H、F 各管什么，在 lcapy 里怎么写？", mini: true },
  { slug: 'autoaim', title: "RoboMaster 自瞄：从数据到解算", date: '2025-09-13', topic: 'RoboMaster', dek: "检测框只回答“大概在哪”。要打得准，得从数据一路做到解算。", mini: true },
  { slug: 'regression', title: "线性回归的五个假设", date: '2025-09-12', topic: '统计', dek: "OLS 什么时候可信：五个假设各管什么，怎么从残差上看出来，违反了怎么办。", mini: true },
  { slug: 'ece-application', title: "ECE 研究生申请", date: '2025-09-03', topic: '升学', dek: "投几个项目、什么时候交、各地看什么：先把规则弄清楚，再谈选校。", mini: true },
  { slug: 'verilog', title: "Verilog 入门：wire、reg 和时钟", date: '2025-09-02', topic: '数字电路', dek: "写的明明是代码，描述的却是电路：assign 和 always 到底差在哪？", mini: true },
  { slug: 'kayuan', title: "抓一个小程序的 GraphQL 接口", date: '2025-04-10', topic: '工程', dek: "小程序一页只给 10 条帖子、每条只带 3 条评论，接口到底是怎么分页的？", mini: true },
  { slug: 'jacobian', title: "换元为什么要乘雅可比", date: '2025-04-07', topic: '数学', dek: "积分算的是面积。换元把小方格拉变了形，雅可比行列式就是面积被放大的倍数。", mini: true },
  { slug: 'group', title: "对称就是群", date: '2025-04-05', topic: '数学', dek: "正方形有 8 种对称。把“挪法”本身当成元素，它们怎么复合，就是群论要研究的全部结构。", mini: true },
  { slug: 'library', title: "某图书管理系统的分析", date: '2025-04-01', topic: '工程', dek: "接口给的是毫秒时间戳，几点哪间房空着？", mini: true },
  { slug: 'logic', title: "从 NAND 搭出所有门", date: '2025-03-22', topic: '数字电路', dek: "只给你一种 NAND 门，怎么拼出 NOT、AND、OR、XOR？为什么一种就够？", mini: true },
  { slug: 'lambda', title: "Lambda 初窥", date: '2025-03-13', topic: '计算理论', dek: "只用函数，能不能写出数字、加减乘除和递归？", mini: true },
];

// 随笔：原样。首页和随笔页直接把正文摆出来，正文从各自页面里读。
export const TEXTS = [
  { slug: 'sign-language', title: '从“虾线男朋友”到威廉·福克纳：语言的物理性与思维的原生状态', date: '2025-11-24', kind: '随想' },
  { slug: 'leaving-yale', title: '别耶鲁', date: '2025-08-02', kind: '随笔' },
  { slug: 'doro-and-railway-station', title: 'Doro和火车站台', date: '2025-05-26', kind: '转载' },
  { slug: 'cake', title: '蛋糕', date: '2025-05-02', kind: '随笔' },
  { slug: 'grey-product', title: '为什么做灰产会比大部分正规行业赚得更多', date: '2025-04-25', kind: '转载' },
  { slug: 'blue-hour', title: '蓝调时刻', date: '2025-04-10', kind: '随笔' },
  { slug: 'meiqian', title: '美签总结', date: '2025-04-08', kind: '攻略' },
  { slug: 'yexiao', title: '夜宵', date: '2025-04-07', kind: '随笔' },
  { slug: 'shuixingle', title: '睡醒了', date: '2025-04-06', kind: '随笔' },
  { slug: 'flcl', title: 'FLCL(fooly cooly)', date: '2025-04-05', kind: '观后感' },
  { slug: 'xiaoniao', title: '小鸟', date: '2025-04-03', kind: '照片' },
  { slug: 'bing', title: '溜大了', date: '2025-02-25', kind: '随笔' },
  { slug: 'you-wake-up', title: 'wake up', date: '2025-02-20', kind: '随笔' },
  { slug: 'summer', title: '夏', date: '2025-01-04', kind: '随笔' },
];

// 速查：信息类的短东西，首页公告栏一行一条。size 决定点开是浮窗（short）还是抽屉（long）。
// 页面在 /notes/<slug>/，内容取它的 .note-body。
export const NOTES = [
  { slug: 'mac-shortcuts', title: 'mac 快捷键', date: '2026-03-24', line: '按住修饰键，筛出能用的组合', size: 'long' },
  { slug: 'skills', title: '给 AI 装技能：skills 与 MCP', date: '2026-03-24', line: '先去 skills.sh 搜，找不到再去 skillsmp', size: 'short' },
  { slug: 'windows', title: 'Windows 装机清单', date: '2026-01-23', line: '工具箱、美化、激活、跳过联网', size: 'long' },
  { slug: 'silksong', title: '丝之歌 mod（mac）', date: '2025-09-15', line: 'Intel 和 Apple 芯片各自怎么装 BepInEx', size: 'short' },
  { slug: 'back-to-macos', title: '从 Windows 换回 macOS', date: '2025-09-06', line: '开机按住哪个键，Boot Camp 分区怎么删', size: 'short' },
  { slug: 'lgu-courses', title: '港中深课程评价与校历', date: '2025-09-01', line: '课程评价链接和 2025–26 校历', size: 'long' },
  { slug: 'a00-car', title: '5 万以内的电动小车', date: '2025-08-27', line: '五款 A00 小车按价格、续航、快充比一比', size: 'long' },
  { slug: 'excel-eval', title: 'Excel 计算单元格里的算式', date: '2025-08-20', line: 'EVALUATE 加上去掉结尾的 +', size: 'short' },
  { slug: 'filename-sum', title: '从文件名里把金额加起来', date: '2025-04-09', line: '一个正则把发票文件名里的数字加起来', size: 'short' },
];

// 工具：只留这一个；其余归档。
export const TOOLS = [
  { file: 'cec-tool.html', title: 'CEC 工具', line: '讲座动态二维码：扫一次，本地按 5 秒周期刷新', mini: '/tools/cec-mini.js' },
];
export const ARCHIVED_TOOLS = [
  { file: 'camera.html', title: 'Steel Ball Camera' },
  { file: 'classtable.html', title: 'Class Schedule Pro' },
  { file: 'color-recognize.html', title: '图片颜色识别' },
  { file: 'conflict_viewer.html', title: '冲突回顾' },
  { file: 'deepseek-usage-analyzer.html', title: 'DeepSeek API 用量分析与涨价预估' },
  { file: 'field-map-measure.html', title: '210cm 场地测距地图' },
  { file: 'label-chat.html', title: 'Label Chat — AI 标签排版' },
  { file: 'markdown_a4_studio.html', title: 'Markdown A4 Studio' },
  { file: 'pdf-split.html', title: 'PDF 超清切分与空白切除' },
  { file: 'pnp-test.html', title: '手机 PnP 路标定位' },
  { file: 'resume-generator.html', title: 'Resume Builder' },
  { file: 'segment.html', title: 'JLC 轮廓标注器' },
  { file: 'skycode.html', title: 'Sky Code' },
  { file: 'timer.html', title: '极简倒计时' },
];

export const md = d => d.slice(5).replace('-', '·');
