import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getProjects, getProjectById, getProjectByName, addProject, removeProject } from './projects.js';
import { listFiles, getFileContent } from './files.js';
import { search } from './search.js';
import { gitStatus, gitDiff, gitStage, gitUnstage, gitCommit } from './git.js';
import { browseDirs } from './browse.js';
import { aiCommitMessage, getAiConfig } from './ai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const PRODUCTION = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

function resolveProjectFromWildcard(wildcard) {
  const projects = getProjects();
  let bestMatch = null;
  let bestLen = 0;

  for (const project of projects) {
    const projPath = project.path.replace(/^\//, '');
    if (wildcard === projPath || wildcard.startsWith(projPath + '/')) {
      if (projPath.length > bestLen) {
        bestMatch = project;
        bestLen = projPath.length;
        var actionAndRest = wildcard.slice(projPath.length + 1);
      }
    }
  }

  if (!bestMatch) {
    const firstPart = wildcard.split('/')[0];
    const byId = getProjectById(firstPart);
    const byName = getProjectByName(firstPart);
    if (byId) return { project: byId, actionAndRest: wildcard.slice(firstPart.length + 1) };
    if (byName) return { project: byName, actionAndRest: wildcard.slice(firstPart.length + 1) };
    return null;
  }

  return { project: bestMatch, actionAndRest: actionAndRest };
}

app.get('/api/projects', (req, res) => {
  const projects = getProjects();
  res.json(projects);
});

app.get('/api/projects/*', (req, res) => {
  const wildcard = req.params[0];
  const result = resolveProjectFromWildcard(wildcard);
  if (!result) return res.status(404).json({ error: '项目不存在' });
  const { project, actionAndRest } = result;
  req.params.projectId = project.id;

  if (!actionAndRest) {
    return res.json(project);
  }

  const [action, ...restParts] = actionAndRest.split('/');
  const rest = restParts.join('/');

  if (action === 'files') return listFiles(req, res);
  if (action === 'code') return getFileContent(req, res);
  if (action === 'search') return search(req, res);
  if (action === 'git') {
    if (rest === 'status') return gitStatus(req, res);
    if (rest === 'diff') return gitDiff(req, res);
  }

  res.status(404).json({ error: '未知操作' });
});

app.post('/api/projects/*/git/stage', (req, res) => {
  const wildcard = req.params[0];
  const result = resolveProjectFromWildcard(wildcard);
  if (!result) return res.status(404).json({ error: '项目不存在' });
  req.params.projectId = result.project.id;
  gitStage(req, res);
});

app.post('/api/projects/*/git/unstage', (req, res) => {
  const wildcard = req.params[0];
  const result = resolveProjectFromWildcard(wildcard);
  if (!result) return res.status(404).json({ error: '项目不存在' });
  req.params.projectId = result.project.id;
  gitUnstage(req, res);
});

app.post('/api/projects/*/git/commit', (req, res) => {
  const wildcard = req.params[0];
  const result = resolveProjectFromWildcard(wildcard);
  if (!result) return res.status(404).json({ error: '项目不存在' });
  req.params.projectId = result.project.id;
  gitCommit(req, res);
});

app.post('/api/projects/*/git/ai-commit', (req, res) => {
  const wildcard = req.params[0];
  const result = resolveProjectFromWildcard(wildcard);
  if (!result) return res.status(404).json({ error: '项目不存在' });
  req.params.projectId = result.project.id;
  aiCommitMessage(req, res);
});

app.get('/api/ai/config', getAiConfig);
app.get('/api/browse', browseDirs);

app.post('/api/projects', (req, res) => {
  const { name, path: projPath } = req.body;
  if (!name || !projPath) return res.status(400).json({ error: '名称和路径不能为空' });
  const result = addProject(name, projPath);
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

app.delete('/api/projects/:projectId', (req, res) => {
  const result = removeProject(req.params.projectId);
  if (result.error) return res.status(404).json(result);
  res.json(result);
});

if (PRODUCTION) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  if (PRODUCTION) {
    console.log(`CodeReader running at http://localhost:${PORT} (production)`);
  } else {
    console.log(`CodeReader API server running at http://localhost:${PORT}`);
  }
});
