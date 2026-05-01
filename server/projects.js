import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const LANGUAGE_MAP = {
  '.ts': { name: 'TypeScript', color: '#3178c6' },
  '.tsx': { name: 'TypeScript', color: '#3178c6' },
  '.js': { name: 'JavaScript', color: '#f1e05a' },
  '.jsx': { name: 'JavaScript', color: '#f1e05a' },
  '.css': { name: 'CSS', color: '#563d7c' },
  '.scss': { name: 'SCSS', color: '#c6538c' },
  '.html': { name: 'HTML', color: '#e34c26' },
  '.json': { name: 'JSON', color: '#292929' },
  '.md': { name: 'Markdown', color: '#083fa1' },
  '.py': { name: 'Python', color: '#3572A5' },
  '.go': { name: 'Go', color: '#00ADD8' },
  '.rs': { name: 'Rust', color: '#dea584' },
  '.java': { name: 'Java', color: '#b07219' },
  '.sh': { name: 'Shell', color: '#89e051' },
  '.yaml': { name: 'YAML', color: '#cb171e' },
  '.yml': { name: 'YAML', color: '#cb171e' },
  '.toml': { name: 'TOML', color: '#9c4221' },
};

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '.nuxt',
  'coverage', '.cache', '.turbo', '.vercel', '.terraform',
]);

const IGNORED_FILES = new Set([
  '.DS_Store', 'Thumbs.db',
]);

function countFiles(dir) {
  let count = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      if (IGNORED_FILES.has(entry.name)) continue;
      if (entry.isDirectory()) {
        count += countFiles(path.join(dir, entry.name));
      } else {
        count++;
      }
    }
  } catch { /* skip */ }
  return count;
}

function collectLangBytes(dir) {
  const langBytes = {};
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      if (IGNORED_FILES.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const sub = collectLangBytes(fullPath);
        for (const [lang, bytes] of Object.entries(sub)) {
          langBytes[lang] = (langBytes[lang] || 0) + bytes;
        }
      } else {
        const ext = path.extname(entry.name);
        const langInfo = LANGUAGE_MAP[ext];
        if (langInfo) {
          try {
            const stat = fs.statSync(fullPath);
            langBytes[langInfo.name] = (langBytes[langInfo.name] || 0) + stat.size;
          } catch { /* skip */ }
        }
      }
    }
  } catch { /* skip */ }
  return langBytes;
}

function computeLanguages(dir) {
  const langBytes = collectLangBytes(dir);
  const totalBytes = Object.values(langBytes).reduce((a, b) => a + b, 0);
  if (totalBytes === 0) return [];

  const colorMap = {};
  for (const info of Object.values(LANGUAGE_MAP)) {
    colorMap[info.name] = info.color;
  }

  return Object.entries(langBytes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, bytes]) => ({
      name,
      percent: Math.round((bytes / totalBytes) * 100),
      color: colorMap[name] || '#999',
    }));
}

export function getProjects() {
  return config.projects.map((p, i) => {
    const resolvedPath = path.resolve(__dirname, '..', p.path);
    let branch = 'main';
    let hasChanges = false;
    try {
      branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: resolvedPath, encoding: 'utf-8' }).trim();
      const status = execSync('git status --porcelain', { cwd: resolvedPath, encoding: 'utf-8' }).trim();
      hasChanges = status.length > 0;
    } catch { /* not a git repo */ }

    return {
      id: String(i + 1),
      name: p.name,
      path: resolvedPath,
      branch,
      files: countFiles(resolvedPath),
      hasChanges,
      languages: computeLanguages(resolvedPath),
    };
  });
}

export function getProjectById(id) {
  const projects = getProjects();
  return projects.find(p => p.id === id) || null;
}

export function addProject(name, projPath) {
  const resolvedPath = path.resolve(projPath);
  if (!fs.existsSync(resolvedPath)) {
    return { error: '路径不存在' };
  }
  const exists = config.projects.some(
    p => path.resolve(__dirname, '..', p.path) === resolvedPath
  );
  if (exists) {
    return { error: '该项目已存在' };
  }
  config.projects.push({ name, path: path.relative(path.join(__dirname, '..'), resolvedPath) || '.' });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  return { success: true };
}

export function removeProject(id) {
  const idx = parseInt(id, 10) - 1;
  if (idx < 0 || idx >= config.projects.length) return { error: '项目不存在' };
  config.projects.splice(idx, 1);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  return { success: true };
}

export function getProjectPath(id) {
  const idx = parseInt(id, 10) - 1;
  if (idx < 0 || idx >= config.projects.length) return null;
  return path.resolve(__dirname, '..', config.projects[idx].path);
}
