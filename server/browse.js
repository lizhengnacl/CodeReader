import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

const HIDDEN_DIRS = new Set([
  '.git', '.svn', '.hg', '.DS_Store', '.Trash', '.TemporaryItems',
  '.Spotlight-V100', '.fseventsd',
]);

export function browseDirs(req, res) {
  const reqPath = (req.query.path || os.homedir());

  try {
    const stat = fs.statSync(reqPath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: '不是目录' });
    }

    const entries = fs.readdirSync(reqPath, { withFileTypes: true });
    const dirs = entries
      .filter(e => e.isDirectory() && !e.name.startsWith('.') && !HIDDEN_DIRS.has(e.name))
      .map(e => ({
        name: e.name,
        path: path.join(reqPath, e.name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const parentPath = path.dirname(reqPath);
    const hasParent = reqPath !== '/';

    res.json({
      currentPath: reqPath,
      parentPath: hasParent ? parentPath : null,
      dirs,
      homePath: os.homedir(),
      commonPaths: getCommonPaths(),
    });
  } catch (err) {
    res.status(500).json({ error: '无法访问该目录', detail: err.message });
  }
}

function getCommonPaths() {
  const home = os.homedir();
  const paths = [
    { label: '主目录', path: home, icon: 'home' },
    { label: '桌面', path: path.join(home, 'Desktop'), icon: 'desktop' },
    { label: '文档', path: path.join(home, 'Documents'), icon: 'doc' },
    { label: '下载', path: path.join(home, 'Downloads'), icon: 'download' },
  ];

  try {
    const devPath = path.join(home, 'code');
    if (fs.existsSync(devPath)) {
      paths.push({ label: 'code', path: devPath, icon: 'code' });
    }
  } catch { /* skip */ }

  try {
    const projectsPath = path.join(home, 'projects');
    if (fs.existsSync(projectsPath)) {
      paths.push({ label: 'projects', path: projectsPath, icon: 'code' });
    }
  } catch { /* skip */ }

  return paths.filter(p => {
    try { return fs.existsSync(p.path); } catch { return false; }
  });
}
