import { execSync } from 'child_process';
import { getProjectPath } from './projects.js';

export function gitStatus(req, res) {
  const { projectId } = req.params;
  const projectRoot = getProjectPath(projectId);

  if (!projectRoot) {
    return res.status(404).json({ error: '项目不存在' });
  }

  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: projectRoot,
      encoding: 'utf-8',
    }).trim();

    const porcelain = execSync('git status --porcelain', {
      cwd: projectRoot,
      encoding: 'utf-8',
    }).trim();

    const staged = [];
    const unstaged = [];

    if (porcelain) {
      for (const line of porcelain.split('\n')) {
        const indexStatus = line[0];
        const workTreeStatus = line[1];
        const filePath = line.slice(3);

        const statusMap = {
          'M': 'M',
          'A': 'A',
          'D': 'D',
          'R': 'R',
          'C': 'C',
          '?': 'U',
          '!': 'I',
        };

        if (indexStatus !== ' ' && indexStatus !== '?') {
          staged.push({
            filePath,
            status: statusMap[indexStatus] || indexStatus,
          });
        }

        if (workTreeStatus !== ' ' || indexStatus === '?') {
          unstaged.push({
            filePath,
            status: indexStatus === '?' ? 'U' : (statusMap[workTreeStatus] || workTreeStatus),
          });
        }
      }
    }

    res.json({ branch, staged, unstaged });
  } catch (err) {
    res.status(500).json({ error: '获取 Git 状态失败', detail: err.message });
  }
}
