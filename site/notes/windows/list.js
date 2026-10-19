// 速查图：Windows 装机清单。勾软件和设置项 → 生成自己的下载清单、手动步骤和命令（命令原样，按在哪运行分好组）。
import { flash } from '/assets/fig.js';

const L = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;

// where：命令在哪运行
const WHERE = { oobe: '装系统时的激活页面：按 Shift+F10 打开 cmd', ps: 'PowerShell（管理员）', msys: 'MSYS2 MSYS 窗口（开始菜单里搜 MSYS2 MSYS）', bash: 'WSL / Linux 终端' };

export const GROUPS = [
  { g: '工具箱', items: [
    { id: 'adobe1', t: L('https://workspace.dingtalk.com/9e2e3rFbYuqVG1enZL7WDX', 'Adobe&amp;设计软件汇总(星野设计学)') },
    { id: 'adobe2', t: L('https://www.vposy.com/page/3', 'Adobe软件汇总(Vposy大神)') },
    { id: 'cencrack', t: L('http://cencrack.com/?post=18', 'Cencrack工具箱：盗版软件合集') },
    { id: 'tbtool', t: L('https://www.tbtool.cn/', '图吧工具箱：计算机测试软件合集') },
    { id: 'powertoys', t: L('https://github.com/microsoft/PowerToys/releases', 'PowerToys：Windows系统增强工具'), tip: '建议把powertoys run关了，然后使用命令面板，可以直接把应用丢桌面然后当spotlight用' },
  ] },
  { g: '美化', items: [
    { id: 'yasb', t: L('https://github.com/amnweb/yasb/wiki/Installation', 'yasb：窗口美化工具'), tip: `顶部状态栏。启动后右键菜单 get theme安装好看主题，然后可以去${L('https://github.com/amnweb/yasb/wiki/', 'wiki')}抄配置添加好看小组件(例如${L('https://github.com/amnweb/yasb/wiki/(Widget)-Pomodoro', '番茄钟')}和cpu显示)` },
    { id: 'ttb', t: L('https://github.com/TranslucentTB/TranslucentTB/releases/tag/2025.1', 'TranslucentTB：任务栏透明工具') },
    { id: 'ep', t: L('https://github.com/valinet/ExplorerPatcher/releases/tag/26100.4946.69.6_7384790', 'ExplorerPatcher：win11恢复win10菜单和任务栏'), tip: '安装后右键任务栏-属性，进行设置' },
  ] },
  { g: '软件', items: [
    { id: 'localsend', t: L('https://localsend.org/download', 'Local Send：局域网传文件') },
    { id: 'geek', t: L('https://geekuninstaller.com/download', 'Geek ：软件卸载工具') },
    { id: 'everything', t: L('https://www.voidtools.com/', 'Everything：文件查找工具') },
    { id: 'cfw', t: L('https://github.com/clash-download/clash-for-windows/releases', '冲突窗口：猫猫') },
    { id: 'bandizip', t: L('https://www.bandisoft.com/bandizip/old/6/', 'Bandzip6：老版本无广告解压文件') },
    { id: 'snipaste', t: L('https://zh.snipaste.com/', 'Snipaste：好用的截图贴图软件'), tip: 'windows自带截图win+shift+s' },
    { id: 'audiorelay', t: L('https://audiorelay.net/downloads', 'audiorelay：跨端传音频') },
  ] },
  { g: '小工具', items: [
    { id: 'cmm', t: L('https://github.com/BluePointLilac/ContextMenuManager/releases/tag/3.3.3.1', 'ContextMenuManager：右键菜单管理') },
    { id: 'reddot', t: L('https://github.com/Autumn-one/RedDot', 'RedDot：中英文输入法切换'), tip: `输入法中英文状态显示，建议打开“英文切换到美式键盘”选项。可以自己改图片换成好看的${L('https://upload.wikimedia.org/wikipedia/commons/2/20/MJd1-.svg', '图标')}` },
    { id: 'debloat', t: L('https://github.com/Raphire/Win11Debloat', 'Windows11自带软件卸载') },
  ] },
  { g: '系统设置', items: [
    { id: 'local', t: 'win11 跳过用户激活（不登微软账户）', where: 'oobe', cmd: 'start ms-cxh:localonly' },
    { id: 'nopwd', t: 'win11 关闭用户密码', step: 'ctrl + alt + del 打开安全选项界面，然后选择更改密码，密码留空' },
    { id: 'noupd', t: 'win11 关闭自动更新', where: 'ps', cmd: 'New-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\WindowsUpdate\\UX\\Settings" -Name "FlightSettingsMaxPauseDays" -Value 3650 -PropertyType DWORD -Force', step: '运行后去设置的更新中，将会有521周后更新的选项' },
  ] },
  { g: '开发环境', items: [
    { id: 'policy', t: '允许运行脚本（先跑这个，避免后续脚本无法正常运行）', where: 'ps', cmd: 'Set-ExecutionPolicy -ExecutionPolicy RemoteSigned' },
    { id: 'winget', t: `winget 重置 msstore 源（${L('https://learn.microsoft.com/zh-cn/windows/package-manager/winget/', '官方文档')}）`, tip: 'win11自带winget，如果msstore源没有正常配置，可以运行下面命令进行重置', where: 'ps', cmd: 'winget source reset msstore' },
    { id: 'wingetcn', t: 'winget 换国内源', where: 'ps', cmd: '#如果需要更换国内源：\nwinget source remove winget\nwinget source add winget https://mirrors.ustc.edu.cn/winget-source\nwinget source reset --force\nwinget source update' },
    { id: 'wsl', t: `WSL（${L('https://learn.microsoft.com/zh-cn/windows/wsl/install', '官方教程')}）`, where: 'ps', cmd: 'wsl --install\n# 重启后输入：\nwsl --list --online  #查看发行版\nwsl --install -d <DistroName># 安装指定版本 要设置密码\n\n#如果忘记密码，可以管理员运行powershell\n wsl.exe --user root\n #然后修改指定用户密码\n passwd <username>', step: '第一行装完 WSL 功能后要重启' },
    { id: 'apt', t: `Ubuntu apt 换源（${L('https://mirrors.ustc.edu.cn/help/ubuntu.html#__tabbed_4_4', 'USTC换源文档')}）`, step: `用${L('https://mirrors.ustc.edu.cn/repogen/', 'USTC换源文件生成器')}生成，替换/etc/apt/sources.list` },
    { id: 'xget', t: L('https://github.com/xixu-me/xget', '下载换源（xget）') },
    { id: 'clash', t: `Linux 里装 ${L('https://github.com/nelvko/clash-for-linux-install', 'clash')}`, where: 'bash', cmd: 'git clone --branch master --depth 1 https://gh-proxy.org/https://github.com/nelvko/clash-for-linux-install.git \\\n  && cd clash-for-linux-install \\\n  && bash install.sh' },
    { id: 'gcc', t: 'C/C++ 编译器（MSYS2）', where: 'ps', cmd: 'winget install MSYS2.MSYS2 #这步是在下载linux的windows中间层', more: { where: 'msys', cmd: 'pacman -S --needed mingw-w64-ucrt-x86_64-toolchain\n#随后按两次回车：安装所有包、确认安装' }, after: { where: 'ps', cmd: '#安装完成后根据安装位置，运行下面命令，添加环境变量\n[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\\msys64\\ucrt64\\bin", "Machine")' } },
    { id: 'git', t: 'git', where: 'ps', cmd: 'winget install Git.Git' },
    { id: 'uv', t: `uv（${L('https://docs.astral.sh/uv/concepts/configuration-files/', '官方配置文档')}）`, where: 'ps', cmd: 'winget install --id=astral-sh.uv -e\n# uv换源\n# 方法一：临时换源\nexport UV_DEFAULT_INDEX="https://mirrors.aliyun.com/pypi/simple"', step: '方法二：修改配置。在本地 pyproject.toml 里写 <code>[[tool.uv.index]]</code>；全局写在 uv.toml（Linux和MacOS一般是~/.config/uv/uv.toml，Windows一般是%APPDATA%/uv/uv.toml，路径不存在手动创建即可）里写 <code>[[index]]</code>，内容见下面', conf: '# 如果在本地配置pyproject.toml，写入如下配置\n[[tool.uv.index]]\nurl = "https://mirrors.ustc.edu.cn/pypi/simple"\ndefault = true\n# 如果在全局配置uv.toml，写入如下配置\n[[index]]\nurl = "https://mirrors.ustc.edu.cn/pypi/simple"\ndefault = true' },
  ] },
];
const ALL = GROUPS.flatMap(g => g.items);
export const PRESETS = {
  dev: ['policy', 'winget', 'wsl', 'gcc', 'git', 'uv'],
  fresh: ['local', 'nopwd', 'noupd', 'powertoys', 'everything', 'snipaste', 'bandizip', 'localsend', 'geek'],
  pretty: ['yasb', 'ttb', 'ep', 'reddot', 'powertoys'],
};

const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
function copy(text, btn) {
  const done = () => { const t = btn.textContent; btn.textContent = '已复制'; setTimeout(() => (btn.textContent = t), 1200); };
  navigator.clipboard?.writeText(text).then(done, () => {});
}

export default function (fig) {
  const pick = fig.querySelector('.pick'), out = fig.querySelector('.out'), count = fig.querySelector('.readout');
  const st = { on: new Set(PRESETS.fresh) };
  pick.innerHTML = GROUPS.map(g => `<fieldset><legend>${g.g}</legend>${g.items.map(it => `<label><input type="checkbox" value="${it.id}"><span>${it.t.replace(/<a [^>]*>|<\/a>/g, '')}</span></label>`).join('')}</fieldset>`).join('');

  function draw() {
    pick.querySelectorAll('input').forEach(i => { i.checked = st.on.has(i.value); });
    const on = ALL.filter(it => st.on.has(it.id));
    const dl = on.filter(it => !it.cmd && !it.step), steps = on.filter(it => it.step && !it.cmd);
    // 命令按在哪运行分组，保持清单顺序
    const blocks = [];
    const add = (where, cmd, label) => { let b = blocks.find(x => x.where === where); if (!b) blocks.push(b = { where, lines: [] }); b.lines.push(`# —— ${label}\n${cmd}`); };
    const strip = s => s.replace(/<[^>]+>/g, '');
    on.filter(it => it.cmd).forEach(it => { add(it.where, it.cmd, strip(it.t)); if (it.more) add(it.more.where, it.more.cmd, strip(it.t)); if (it.after) add(it.after.where, it.after.cmd, strip(it.t)); });
    const order = ['oobe', 'ps', 'msys', 'bash']; blocks.sort((a, b) => order.indexOf(a.where) - order.indexOf(b.where));
    const cmdNotes = on.filter(it => it.cmd && (it.step || it.tip || it.conf));
    out.innerHTML =
      (dl.length ? `<h4>下载（${dl.length}）</h4><ol>${dl.map(it => `<li>${it.t}${it.tip ? `<div class="tip">${it.tip}</div>` : ''}</li>`).join('')}</ol>` : '') +
      (steps.length ? `<h4>手动设置（${steps.length}）</h4><ol>${steps.map(it => `<li><b>${it.t}</b>：${it.step}</li>`).join('')}</ol>` : '') +
      (blocks.length ? `<h4>命令</h4>${blocks.map((b, i) => `<div class="blk"><div class="lab"><span>${WHERE[b.where]}</span><button type="button" class="btn" data-copy="${i}">复制</button></div><pre><code>${esc(b.lines.join('\n\n'))}</code></pre></div>`).join('')}` : '') +
      (cmdNotes.length ? `<ul class="notes">${cmdNotes.map(it => `<li><b>${strip(it.t)}</b>：${[it.tip, it.step].filter(Boolean).join('；')}${it.conf ? `<pre><code>${esc(it.conf)}</code></pre>` : ''}</li>`).join('')}</ul>` : '') +
      (on.length ? '' : '<p class="none">左边勾几项，这里就生成清单。</p>');
    count.innerHTML = `勾了 <b class="ok">${on.length}</b> / ${ALL.length} 项：下载 ${dl.length}，手动 ${steps.length}，命令 ${blocks.reduce((s, b) => s + b.lines.length, 0)} 段。`;
    out._blocks = blocks;
  }
  pick.addEventListener('change', e => { const v = e.target.value; e.target.checked ? st.on.add(v) : st.on.delete(v); draw(); });
  out.addEventListener('click', e => { const b = e.target.closest('[data-copy]'); if (b) copy(out._blocks[+b.dataset.copy].lines.join('\n\n'), b); });
  fig.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => { const p = b.dataset.preset; st.on = new Set(p === 'all' ? ALL.map(i => i.id) : p === 'none' ? [] : PRESETS[p]); draw(); }));
  fig.api = {
    set(o = {}) {
      if (o.preset) st.on = new Set(o.preset === 'all' ? ALL.map(i => i.id) : o.preset === 'none' ? [] : PRESETS[o.preset]);
      if (o.on) st.on = new Set(o.on);
      draw(); flash(fig);
    },
  };
  draw();
}
