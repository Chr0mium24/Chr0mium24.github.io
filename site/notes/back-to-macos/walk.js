// 速查图：从 Boot Camp 的 Windows 回到 macOS，按目的选路。
import { flash } from '/assets/fig.js';
import { mount as walk } from '/assets/steps.js';

const DATA = {
  start: 'goal',
  nodes: {
    goal: {
      title: '想回到什么程度？',
      choices: [
        { label: '这次先进 macOS', to: 'once' },
        { label: '以后默认进 macOS', to: 'default' },
        { label: '彻底删掉 Windows', to: 'remove' },
        { label: '重装 macOS', to: 'reinstall' },
      ],
    },
    once: {
      title: '开机时临时选启动盘',
      list: ['关机。', '按电源键开机，马上按住 <kbd>⌥ Option</kbd>，直到出现启动盘选择界面。', '用 <kbd>←</kbd> <kbd>→</kbd> 选 macOS 的盘，按 <kbd>Return</kbd>。'],
      after: '只管这一次，下次开机还是默认的系统。按住的是 Option 键，不是 command。',
    },
    default: {
      title: '把默认启动改成 macOS',
      list: ['在 Windows 里点任务栏右下角的程序托盘，找到 Boot Camp 图标；托盘里没有，就在开始菜单的程序列表里找 Boot Camp 控制面板。', '打开 Boot Camp 控制面板 → <b>启动磁盘</b>，选 macOS，重新启动。'],
      after: '已经在 macOS 里了也能改：系统设置 → 通用 → 启动磁盘，选 macOS 的盘。',
    },
    remove: {
      title: '删掉 Windows 分区',
      list: ['先进 macOS（开机按住 <kbd>⌥ Option</kbd> 选 macOS 的盘）。', '打开“<b>启动转换助理</b>”（Boot Camp 在 macOS 里现在叫这个，在 应用程序 → 实用工具 里）。', '按提示选<b>恢复</b>：删除 Windows 分区，把空间合并回 macOS 分区。'],
      after: '之后就是纯粹的 macOS 环境了。删之前把 Windows 里要留的文件先拷出来。',
    },
    reinstall: {
      title: '彻底重装 macOS',
      list: ['确保能连上互联网。', '关机状态下按住 <kbd>⌘ Command</kbd> <kbd>R</kbd>，再按电源键，进入 macOS 恢复界面。', '先用<b>磁盘工具</b>重新分配硬盘：一般把所有分区都抹掉，合并建立一个 APFS 分区。', '回到恢复界面选<b>重新安装 macOS</b>：会从苹果官网下载系统安装包重新安装。'],
      after: '过程中基本不需要人工参与，也不用单独装驱动，等就行，时间有点久。（Apple 芯片的 Mac 不用 ⌘R：关机后按住电源键不放，出现“正在载入启动选项”后选“选项”。）',
    },
  },
};

export default function (fig) {
  const w = walk(fig.querySelector('.walk'), DATA);
  fig.api = { set(o = {}) { if (o.path) w.go(o.path); flash(fig); } };
}
