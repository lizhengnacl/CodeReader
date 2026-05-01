import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { getProjectPath } from './projects.js';

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '.nuxt',
  'coverage', '.cache', '.turbo', '.vercel', '.terraform',
]);

function walkDir(dir, projectRoot, callback) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath, projectRoot, callback);
      } else {
        callback(fullPath, projectRoot);
      }
    }
  } catch { /* skip */ }
}

function searchByFileName(projectRoot, query) {
  const results = [];
  const lowerQuery = query.toLowerCase();
  walkDir(projectRoot, projectRoot, (fullPath, root) => {
    const name = path.basename(fullPath);
    if (name.toLowerCase().includes(lowerQuery)) {
      results.push({
        filePath: path.relative(root, fullPath),
        fileName: name,
        type: 'file',
      });
    }
  });
  return results.slice(0, 50);
}

function searchByContent(projectRoot, query) {
  const results = [];
  const lowerQuery = query.toLowerCase();
  const binaryExts = /\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|mp3|mp4|zip|tar|gz|lock)$/i;

  walkDir(projectRoot, projectRoot, (fullPath, root) => {
    if (binaryExts.test(fullPath)) return;
    try {
      const stat = fs.statSync(fullPath);
      if (stat.size > 1024 * 1024) return;
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      const matches = [];
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(lowerQuery)) {
          matches.push({
            lineNumber: i + 1,
            line: lines[i].trim(),
          });
          if (matches.length >= 5) break;
        }
      }
      if (matches.length > 0) {
        results.push({
          filePath: path.relative(root, fullPath),
          fileName: path.basename(fullPath),
          type: 'content',
          matches,
        });
      }
    } catch { /* skip binary / unreadable */ }
  });
  return results.slice(0, 50);
}

function searchBySymbol(projectRoot, query) {
  const results = [];
  const patterns = [
    new RegExp(`(?:function|const|let|var|class|interface|type|enum)\\s+${escapeRegExp(query)}\\b`, 'i'),
    new RegExp(`(?:export\\s+(?:default\\s+)?)?(?:function|const|let|var|class|interface|type|enum)\\s+${escapeRegExp(query)}\\b`, 'i'),
  ];
  const binaryExts = /\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|mp3|mp4|zip|tar|gz|lock)$/i;

  walkDir(projectRoot, projectRoot, (fullPath, root) => {
    if (binaryExts.test(fullPath)) return;
    try {
      const stat = fs.statSync(fullPath);
      if (stat.size > 1024 * 1024) return;
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      const matches = [];
      for (let i = 0; i < lines.length; i++) {
        for (const pattern of patterns) {
          if (pattern.test(lines[i])) {
            matches.push({
              lineNumber: i + 1,
              line: lines[i].trim(),
            });
            break;
          }
        }
        if (matches.length >= 5) break;
      }
      if (matches.length > 0) {
        results.push({
          filePath: path.relative(root, fullPath),
          fileName: path.basename(fullPath),
          type: 'symbol',
          matches,
        });
      }
    } catch { /* skip */ }
  });
  return results.slice(0, 50);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function searchByGit(projectRoot, query) {
  try {
    const output = execSync(
      `git log --all --oneline --grep="${query.replace(/"/g, '\\"')}" -n 20`,
      { cwd: projectRoot, encoding: 'utf-8' }
    ).trim();
    if (!output) return [];
    return output.split('\n').map(line => {
      const [hash, ...msg] = line.split(' ');
      return { hash, message: msg.join(' ') };
    });
  } catch {
    return [];
  }
}

export function search(req, res) {
  const { projectId } = req.params;
  const query = req.query.q || '';
  const type = req.query.type || 'content';
  const projectRoot = getProjectPath(projectId);

  if (!projectRoot) {
    return res.status(404).json({ error: '项目不存在' });
  }

  if (!query.trim()) {
    return res.json({ results: [], total: 0 });
  }

  let results;
  switch (type) {
    case 'file':
      results = searchByFileName(projectRoot, query);
      break;
    case 'symbol':
      results = searchBySymbol(projectRoot, query);
      break;
    case 'git':
      results = searchByGit(projectRoot, query);
      break;
    case 'content':
    default:
      results = searchByContent(projectRoot, query);
      break;
  }

  res.json({ results, total: results.length });
}
