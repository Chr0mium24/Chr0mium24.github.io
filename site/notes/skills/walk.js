// 速查图：装 skill 的流程，找 → 装 → 查 → 更新；skills.sh 没找到就走 skillsmp。
import { flash } from '/assets/fig.js';
import { mount as walk } from '/assets/steps.js';

const DATA = {
  start: 'find',
  nodes: {
    find: {
      title: '找：先去 skills.sh 搜',
      html: '按关键词搜，比如找 React 性能相关的：',
      code: 'npx skills find react performance',
      choices: [{ label: '找到了', to: 'add' }, { label: '没找到', to: 'mp' }],
    },
    add: { title: '装', html: '用 <code>作者/仓库@技能名</code> 装：', code: 'npx skills add vercel-labs/agent-skills@vercel-react-best-practices', next: 'check', nextLabel: '查' },
    check: { title: '查', code: 'npx skills check', next: 'update', nextLabel: '更新' },
    update: { title: '更新', code: 'npx skills update' },
    mp: {
      title: '长尾搜索：<a href="https://skillsmp.com" target="_blank" rel="noopener">skillsmp.com</a>',
      html: 'skillsmp 更像 GitHub 聚合目录，找到以后通常回源仓库自己拉：',
      code: 'git clone https://github.com/<owner>/<repo>.git /tmp/<repo>\ncp -r /tmp/<repo>/<skill-dir> ~/.codex/skills/',
      after: '把 <code>&lt;owner&gt;</code>、<code>&lt;repo&gt;</code>、<code>&lt;skill-dir&gt;</code> 换成找到的仓库和技能文件夹。',
    },
  },
};

export default function (fig) {
  const w = walk(fig.querySelector('.walk'), DATA);
  fig.api = { set(o = {}) { if (o.path) w.go(o.path); flash(fig); } };
}
