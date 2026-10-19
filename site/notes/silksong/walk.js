// 速查图：mac 上给丝之歌装 BepInEx。先选芯片，Intel 直接下，Apple 芯片自己编或用别人编好的。
import { flash } from '/assets/fig.js';
import { mount as walk } from '/assets/steps.js';

const a = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const GAME = '/Users/cr/Library/Application Support/Steam/steamapps/common/Hollow Knight Silksong/run_bepinex.sh';

const unzip = next => ({
  title: '解压到游戏目录，给权限',
  html: '把 zip 里的 4 个文件解压到 Hollow Knight Silksong.app 的同目录（下面叫 <code>$GamePath</code>；Steam 里右键游戏 → 管理 → 浏览本地文件就能打开它），在这个目录里运行：',
  code: 'chmod +x run_bepinex.sh libdoorstop.dylib\nsudo xattr -r -d com.apple.quarantine libdoorstop.dylib',
  next, nextLabel: '设 Steam 启动项',
});
const steam = cmd => ({
  title: 'Steam 启动项',
  html: 'Steam 里右键丝之歌 → 属性 → 通用 → 启动选项，填下面这行，目录换成你的 <code>$GamePath</code>：',
  code: cmd, next: 'mods', nextLabel: '装 mod',
});

const DATA = {
  start: 'chip',
  nodes: {
    chip: {
      title: '你的 Mac 是什么芯片？',
      html: '左上角苹果菜单 → 关于本机：写“芯片 Apple M…”的是 Apple 芯片，写“处理器 Intel…”的是 Intel。',
      choices: [{ label: 'Intel', to: 'intel' }, { label: 'Apple 芯片（M 系列）', to: 'arm' }],
    },
    intel: {
      title: '下载 Intel 版 BepInEx',
      html: `GitHub 发布页直接有：${a('https://github.com/BepInEx/BepInEx/releases/download/v5.4.23.3/BepInEx_macos_x64_5.4.23.3.zip', 'BepInEx_macos_x64_5.4.23.3.zip')}`,
      next: 'unzip-intel', nextLabel: '解压',
    },
    arm: {
      title: 'Apple 芯片版 BepInEx',
      html: `官方没有 arm 包，${a('https://github.com/BepInEx/BepInEx/issues/899', 'GitHub issue #899')} 里给了两条路：`,
      choices: [{ label: '自己编译', to: 'build' }, { label: '用别人编好的', to: 'prebuilt' }],
    },
    build: {
      title: '自己编译',
      html: `基于已有 PR 汇总的分支 ${a('https://github.com/Krakazybik/BepInEx/tree/feat/harmony-v-2-15-0', 'Krakazybik/BepInEx 的 feat/harmony-v-2-15-0')}，拉下来编译：`,
      code: [
        { label: '拉分支', code: 'git clone -b feat/harmony-v-2-15-0 https://github.com/Krakazybik/BepInEx.git\ncd BepInEx' },
        { label: '编译（ghp_xxx 换成你自己的 GitHub token）', code: 'export GITHUB_TOKEN=ghp_xxx\n./build.sh --target=Pack --doorstop_run=17548755183' },
      ],
      next: 'unzip-arm', nextLabel: '解压',
    },
    prebuilt: {
      title: '用别人编好的',
      html: `issue 里也有人放了自己编好的包，风险自负：${a('https://github.com/user-attachments/files/22302507/BepInEx_macos_arm64_5.4.23.3.zip', 'BepInEx_macos_arm64_5.4.23.3.zip')}`,
      next: 'unzip-arm', nextLabel: '解压',
    },
    'unzip-intel': unzip('steam-intel'),
    'unzip-arm': unzip('steam-arm'),
    'steam-intel': steam(`"${GAME}" %command%`),
    'steam-arm': steam(`/usr/bin/arch -arm64 /bin/bash "${GAME}" %command%`),
    mods: {
      title: '装 mod',
      html: '启动一次游戏，BepInEx 文件夹下会产生一堆文件，就是初始化成功了。然后去网上下载 mod，把 dll 文件放进 <code>BepInEx/plugins</code> 就行。',
    },
  },
};

export default function (fig) {
  const w = walk(fig.querySelector('.walk'), DATA);
  fig.api = { set(o = {}) { if (o.path) w.go(o.path); flash(fig); } };
}
