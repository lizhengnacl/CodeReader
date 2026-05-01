import fs from 'fs';
import path from 'path';
import { getProjectPath } from './projects.js';

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '.nuxt',
  'coverage', '.cache', '.turbo', '.vercel', '.terraform',
]);

const IGNORED_FILES = new Set([
  '.DS_Store', 'Thumbs.db',
]);

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN');
}

export function listFiles(req, res) {
  const { projectId } = req.params;
  const dirPath = req.query.path || '';
  const projectRoot = getProjectPath(projectId);

  if (!projectRoot) {
    return res.status(404).json({ error: '项目不存在' });
  }

  const targetDir = path.join(projectRoot, dirPath);

  if (!targetDir.startsWith(projectRoot)) {
    return res.status(403).json({ error: '禁止访问' });
  }

  try {
    const entries = fs.readdirSync(targetDir, { withFileTypes: true });
    const folders = [];
    const files = [];

    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      if (IGNORED_FILES.has(entry.name)) continue;

      const fullPath = path.join(targetDir, entry.name);
      const relativePath = path.relative(projectRoot, fullPath);

      if (entry.isDirectory()) {
        let itemCount = 0;
        try {
          itemCount = fs.readdirSync(fullPath).filter(n => !IGNORED_DIRS.has(n) && !IGNORED_FILES.has(n)).length;
        } catch { /* skip */ }
        folders.push({
          name: entry.name,
          type: 'folder',
          path: relativePath,
          itemCount,
        });
      } else {
        let size = 0;
        let mtime = new Date();
        try {
          const stat = fs.statSync(fullPath);
          size = stat.size;
          mtime = stat.mtime;
        } catch { /* skip */ }
        files.push({
          name: entry.name,
          type: 'file',
          path: relativePath,
          size: formatSize(size),
          sizeBytes: size,
          modified: formatTime(mtime),
        });
      }
    }

    folders.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));

    const breadcrumbs = dirPath
      ? dirPath.split('/').reduce((acc, name, i) => {
          const parentPath = dirPath.split('/').slice(0, i + 1).join('/');
          acc.push({ name, path: parentPath });
          return acc;
        }, [{ name: path.basename(projectRoot), path: '' }])
      : [{ name: path.basename(projectRoot), path: '' }];

    res.json({ folders, files, breadcrumbs });
  } catch (err) {
    res.status(500).json({ error: '读取目录失败', detail: err.message });
  }
}

export function getFileContent(req, res) {
  const { projectId } = req.params;
  const filePath = req.query.file || '';
  const projectRoot = getProjectPath(projectId);

  if (!projectRoot) {
    return res.status(404).json({ error: '项目不存在' });
  }

  const fullPath = path.join(projectRoot, filePath);

  if (!fullPath.startsWith(projectRoot)) {
    return res.status(403).json({ error: '禁止访问' });
  }

  try {
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      return res.status(400).json({ error: '不能读取目录' });
    }

    const maxSize = 2 * 1024 * 1024;
    if (stat.size > maxSize) {
      return res.status(413).json({ error: '文件过大，超过 2MB 限制' });
    }

    const isBinary = fullPath.match(/\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|mp3|mp4|zip|tar|gz)$/i);
    if (isBinary) {
      return res.json({ content: '[二进制文件，无法预览]', binary: true });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    res.json({ content, size: stat.size, modified: formatTime(stat.mtime) });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: '文件不存在' });
    }
    res.status(500).json({ error: '读取文件失败', detail: err.message });
  }
}
