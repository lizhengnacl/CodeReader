import express from 'express';
import cors from 'cors';
import { getProjects, getProjectById } from './projects.js';
import { listFiles, getFileContent } from './files.js';
import { search } from './search.js';
import { gitStatus } from './git.js';

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

app.listen(PORT, () => {
  console.log(`CodeReader API server running at http://localhost:${PORT}`);
});
