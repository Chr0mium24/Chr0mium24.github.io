// 图 3：这张图用什么画？用 /assets/steps.js 走一遍分支。
import { flash } from '/assets/fig.js';
import { mount as walk } from '/assets/steps.js';

const a = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;

const DATA = {
  start: 'what',
  nodes: {
    what: { title: '要画的是什么？', choices: [{ label: '流程图、框图、示意图', to: 'drawio' }, { label: '数据图（来自计算结果）', to: 'code' }, { label: '图已经有了，要改字和排版', to: 'svg' }] },
    drawio: {
      title: a('https://app.diagrams.net/', 'draw.io'), html: '拖框连线就能画，导出 svg / png / pdf 都行。',
      choices: [{ label: '要写公式', to: 'math' }, { label: '想让 AI 先出个草稿', to: 'ai' }],
    },
    math: {
      title: '在 draw.io 里写公式',
      list: ['菜单 <b>Extras → Mathematical Typesetting</b> 打开公式渲染。', '反引号 <code>`…`</code> 包住是行内公式，<code>$$…$$</code> 包住是单行公式。', '文字别从别处直接粘：会带着格式。先粘到浏览器地址栏里洗掉格式再复制过来。'],
      choices: [{ label: '公式不显示', to: 'fix-html' }, { label: '文字框有底色', to: 'fix-bg' }],
    },
    'fix-html': { title: '公式不显示', html: '选中这个文字框，点菜单栏的 <code>&lt;&gt;</code>（查看代码），把里面 html 相关的样式删掉。' },
    'fix-bg': { title: '有底色', html: '选中后按 <kbd>⌘</kbd> <kbd>E</kbd> 打开 style 源码面板，删掉底色那一项。' },
    ai: {
      title: '让 AI 出草稿',
      list: ['让大模型直接写 draw.io 的 xml，导入就能接着改。', '或者先用生图模型出一张图，再让 AI 把图转成 xml。', `也有专门的项目：${a('https://github.com/DayuanJiang/next-ai-draw-io', 'next-ai-draw-io')}。`],
    },
    code: {
      title: '代码画图：先拆成两个脚本',
      html: '计算脚本只导出 csv，画图脚本只读 csv。改图的时候只跑后一个（见图 3）。',
      next: 'lib', nextLabel: '挑画图库',
    },
    lib: {
      title: '要什么样的图？',
      choices: [{ label: '论文里的静态图', to: 'sns' }, { label: '网页上能缩放、开关图例', to: 'plotly' }, { label: '边改数据边出图', to: 'st' }, { label: '导入 csv 手动调样式', to: 'veusz' }],
    },
    sns: { title: `${a('https://seaborn.pydata.org/', 'Seaborn')}（${a('https://matplotlib.org/', 'Matplotlib')} 的封装）`, html: '导出时选 svg，标题和标注之后还能改。', next: 'svg', nextLabel: '导出后要改字' },
    plotly: { title: a('https://plotly.com/', 'Plotly'), html: '出的是网页版的图，能缩放、点图例开关曲线。' },
    st: { title: a('https://streamlit.io/', 'Streamlit'), html: '写几行 Python 就是个小网页，改数据、拖参数，图跟着变。' },
    veusz: { title: a('https://veusz.github.io/', 'Veusz'), html: '自己可编辑的画图脚本：导入 csv，在界面里手动调样式。', next: 'svg', nextLabel: '导出后要改字' },
    svg: {
      title: '用 svg 改字和排版',
      choices: [{ label: '直接改代码', to: 'svg-code' }, { label: '拖着改', to: 'svg-gui' }, { label: '要钢笔工具', to: 'svg-pen' }],
    },
    'svg-code': { title: a('https://www.svgviewer.dev/', 'svgviewer.dev'), html: 'svg 代码编辑器，左边改代码右边看效果。' },
    'svg-gui': { title: a('https://boxy-svg.com/app', 'Boxy SVG'), html: 'svg 可视化编辑器，点选、拖动、改文字。' },
    'svg-pen': { title: a('https://www.vectorpea.com/', 'Vectorpea'), html: '在线的 Illustrator，有钢笔工具。' },
  },
};

export default function mount(fig) {
  const w = walk(fig.querySelector('.walk'), DATA);
  fig.api = { set(o = {}) { if (o.path) w.go(o.path); flash(fig); } };
}
