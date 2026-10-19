// 数据：全部来自正文第 3 节「整合包档案」（3.1 社区成熟的包 + 3.2 规模较小或较新的包）。
// tags 是照正文的描述归的类；mods 为 null 的是正文写“未查明”或“特大”。
export const PACKS = [
  // 3.1 社区成熟的包
  { n: 'ATM10', v: '1.21.1', l: '1.21.1 NeoForge', mods: 485, dl: '约 2100 万', note: '地形与科技全覆盖，任务书成熟、官方中文；2026 年 8 月更新 v8.0', tags: ['社区成熟', '中文任务书', '科技', '世界生成好'] },
  { n: 'ATM10 Lite', v: '1.21.1', l: '1.21.1 NeoForge', mods: 206, dl: '13.4 万', note: '战斗模组几乎移除，任务约 3000 个、官方中文；最后选的就是它，补了 18 个模组（见第 4 节）', tags: ['社区成熟', '中文任务书', '科技', '任务 ≥1000', '少打怪'], mine: true },
  { n: 'CLC', v: '1.20.1', l: '1.20.1 Forge', mods: 250, modsText: '250 余', dl: '5.2 万', note: '机械动力主导，地形完成度最高；英文任务书，终局有强制 Boss 战', tags: ['社区成熟', 'Create', '世界生成好', '任务 ≥1000'] },
  { n: 'Monifactory', v: '1.20.1', l: '1.20.1 Forge', mods: 221, dl: '41 万', note: 'GregTech 重工业，官方玩法以和平模式为主', tags: ['社区成熟', '科技', '少打怪'] },
  { n: 'SteamPunk [LPS]', v: '1.20.1', l: '1.20.1 Forge', mods: 331, dl: '290 万', note: '蒸汽朋克城市，机械动力主导，战斗内容少', tags: ['社区成熟', 'Create', '世界生成好', '任务 ≥1000', '少打怪'] },
  { n: 'Craftoria', v: '1.21.1', l: '1.21.1 NeoForge', mods: 500, modsText: '500 余', dl: '276 万', note: 'Tectonic 加超多生物群系，任务 2000 以上', tags: ['社区成熟', '世界生成好', '任务 ≥1000'] },
  { n: 'FTB Evolution', v: '1.21.1', l: '1.21.1 NeoForge', mods: 516, dl: '36.5 万', note: 'FTB 官方出品，科技线齐，玩家评价 Boss 威胁极低', tags: ['社区成熟', '科技', '世界生成好', '少打怪'] },
  { n: 'ATM9', v: '1.20.1', l: '1.20.1 Forge', mods: 400, modsText: '400 余', dl: '千万级', note: '上一代全景包，Thermal、GregTech、通用机械、机械动力都有', tags: ['社区成熟', '科技', 'Create'] },
  { n: 'BMC4', v: '1.20.1', l: '1.20.1 Forge', mods: 250, modsText: '约 250', dl: '1820 万', note: '纯探索向，地牢结构极多，工业科技接近零', tags: ['社区成熟', '探索与 Boss', '世界生成好'] },
  // 3.2 规模较小或较新的包
  { n: 'Catalyst: Ascendance', v: '1.20.1', l: '1.20.1 Forge', mods: 170, modsText: '约 170', dl: '约 1000', note: '模组构成最接近 200 模组的目标，缺完整任务书证据', tags: ['科技', '世界生成好'] },
  { n: 'BUGE Craft S2', v: '1.20.1', l: '1.20.1 Forge', mods: null, modsText: '特大', dl: '73', note: '机械动力全家桶加通用机械、应用能源 2；下载量极小', tags: ['Create', '科技', '世界生成好'] },
  { n: 'Technic Revival', v: '1.21.1', l: '1.21.1 NeoForge', mods: 191, dl: '386', note: '科技与种矿路线匹配，地形较弱', tags: ['Create', '科技'] },
  { n: 'The Devils Pack', v: '1.21.1', l: '1.21.1', mods: null, modsText: '未查明', dl: '社区小', note: '机械动力主导，任务书情况不明', tags: ['Create', '世界生成好'] },
  { n: 'Mattock', v: '1.21.1', l: '1.21.1 NeoForge', mods: 113, dl: '18', note: 'Tekkit 与 Yogbox 的现代复刻，2026 年 8 月发布', tags: ['科技', '世界生成好'] },
  { n: 'Benjamin 2.0', v: '1.21.1', l: '1.21.1 NeoForge', mods: 251, dl: '约 1', note: '纸面配置最全，2026 年 9 月刚发布', tags: ['Create', '科技', '世界生成好'] },
  { n: 'The Great Tangle', v: '1.21.1', l: '1.21.1 NeoForge', mods: 442, dl: '84', note: '宝可梦（Cobblemon）主题的 ATM 式全家桶', tags: [] },
  { n: 'Archimedes the Owl', v: '1.20.1', l: '1.20.1', mods: null, modsText: '未查明', dl: '社区小', note: '种植盆栽、养蜂、神秘农业三条资源线并行', tags: ['种植与魔法'] },
  { n: 'Sourceworks', v: '1.21.1', l: '1.21.1 NeoForge', mods: 127, dl: '社区小', note: '任务书 449 个任务分 15 章，完成度高；缺自动资源路线', tags: ['世界生成好'] },
  { n: 'Verdant Idea', v: '1.20.1', l: '1.20.1 Forge', mods: 105, dl: '15 万', note: '修复荒废世界，300 余任务，魔法比重高', tags: ['种植与魔法', '科技'] },
  { n: 'NewPath Beyond Lands', v: '1.21.1', l: '1.21.1 NeoForge', mods: null, modsText: '未查明', dl: '中等社区', note: '探索为主，科技是配菜', tags: ['探索与 Boss', '世界生成好'] },
  { n: 'Legend Infinity', v: '1.21.1', l: '1.21.1', mods: null, modsText: '未查明', dl: '—', note: '无限资源线，Boss 与战斗比重大', tags: ['科技', '探索与 Boss'] },
  { n: 'Bee Master', v: '1.21.1', l: '1.21.1 NeoForge', mods: 175, dl: '899', note: '养蜂主题，没有通用机械', tags: ['种植与魔法'] },
];
export const WANTS = ['社区成熟', '中文任务书', '科技', 'Create', '探索与 Boss', '种植与魔法', '任务 ≥1000', '少打怪', '世界生成好'];

export function judge(p, { ver, cap, want }) {
  const why = [];
  if (ver !== 'any' && p.v !== ver) why.push(`不是 ${ver}`);
  if ((p.mods != null && p.mods > cap) || (p.modsText === '特大' && cap < 550)) why.push(`${p.modsText ?? p.mods} 个模组超了`);
  want.forEach(w => { if (!p.tags.includes(w)) why.push(`没有“${w}”`); });
  return why;
}
