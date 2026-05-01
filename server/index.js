import express from 'express';
import cors from 'cors';
import { getProjects, getProjectById, addProject, removeProject } from './projects.js';
import { listFiles, getFileContent } from './files.js';
import { search } from './search.js';
import { gitStatus } from './git.js';
import { browseDirs } from './browse.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/projects', (req, res) => {
  const projects = getProjects();
  res.json(projects);
});

app.get('/api/projects/:projectId', (req, res) => {
  const project = getProjectById(req.params.projectId);
  if (!project) return res.status(404).json({ error: '项目不存在' });
  res.json(project);
});

app.get('/api/projects/:projectId/files', listFiles);
app.get('/api/projects/:projectId/code', getFileContent);
app.get('/api/projects/:projectId/search', search);
app.get('/api/projects/:projectId/git/status', gitStatus);
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

app.listen(PORT, () => {
  console.log(`CodeReader API server running at http://localhost:${PORT}`);
});
