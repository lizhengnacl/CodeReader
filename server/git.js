import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
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

    const raw = execSync('git -c core.quotePath=false status --porcelain --untracked-files=all', {
      cwd: projectRoot,
      encoding: 'utf-8',
      maxBuffer: 5 * 1024 * 1024,
    });

    const staged = [];
    const unstaged = [];

    const lines = raw.split('\n').filter(l => l.length >= 3);
    for (const line of lines) {
      const indexStatus = line[0];
      const workTreeStatus = line[1];
      let filePath = line.slice(3);
      if (filePath.startsWith('"') && filePath.endsWith('"')) {
        filePath = filePath.slice(1, -1);
      }

      const statusMap = {
        'M': 'M', 'A': 'A', 'D': 'D', 'R': 'R', 'C': 'C', '?': 'U', '!': 'I',
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

    res.json({ branch, staged, unstaged });
  } catch (err) {
    res.status(500).json({ error: '获取 Git 状态失败', detail: err.message });
  }
}

export function gitDiff(req, res) {
  const { projectId } = req.params;
  const filePath = req.query.file || '';
  const type = req.query.type || 'unstaged';
  const projectRoot = getProjectPath(projectId);

  if (!projectRoot) {
    return res.status(404).json({ error: '项目不存在' });
  }

  try {
    let diffOutput;
    if (type === 'untracked') {
      const fullPath = path.join(projectRoot, filePath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      const lastLine = lines[lines.length - 1];
      if (lastLine === '') lines.pop();
      const diffLines = lines.map(line => `+${line}`);
      diffOutput = `--- /dev/null\n+++ b/${filePath}\n@@ -0,0 +1,${lines.length} @@\n${diffLines.join('\n')}\n`;
    } else if (type === 'staged') {
      diffOutput = execSync(
        `git diff --cached -- ${escapeShellArg(filePath)}`,
        { cwd: projectRoot, encoding: 'utf-8', maxBuffer: 5 * 1024 * 1024 }
      );
    } else {
      diffOutput = execSync(
        `git diff -- ${escapeShellArg(filePath)}`,
        { cwd: projectRoot, encoding: 'utf-8', maxBuffer: 5 * 1024 * 1024 }
      );
    }

    const hunks = parseDiff(diffOutput);
    res.json({ filePath, type, hunks, raw: diffOutput });
  } catch (err) {
    res.status(500).json({ error: '获取 diff 失败', detail: err.message });
  }
}

export function gitStage(req, res) {
  const { projectId } = req.params;
  const { filePath, all } = req.body;
  const projectRoot = getProjectPath(projectId);

  if (!projectRoot) {
    return res.status(404).json({ error: '项目不存在' });
  }

  try {
    if (all) {
      execSync('git add -A', { cwd: projectRoot, encoding: 'utf-8' });
    } else if (filePath) {
      execSync(`git add -- ${escapeShellArg(filePath)}`, { cwd: projectRoot, encoding: 'utf-8' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '暂存失败', detail: err.message });
  }
}

export function gitUnstage(req, res) {
  const { projectId } = req.params;
  const { filePath, all } = req.body;
  const projectRoot = getProjectPath(projectId);

  if (!projectRoot) {
    return res.status(404).json({ error: '项目不存在' });
  }

  try {
    if (all) {
      execSync('git reset HEAD', { cwd: projectRoot, encoding: 'utf-8' });
    } else if (filePath) {
      execSync(`git reset HEAD -- ${escapeShellArg(filePath)}`, { cwd: projectRoot, encoding: 'utf-8' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '取消暂存失败', detail: err.message });
  }
}

export function gitCommit(req, res) {
  const { projectId } = req.params;
  const { message } = req.body;
  const projectRoot = getProjectPath(projectId);

  if (!projectRoot) {
    return res.status(404).json({ error: '项目不存在' });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({ error: '提交信息不能为空' });
  }

  try {
    const output = execSync(
      `git commit -m ${escapeShellArg(message.trim())}`,
      { cwd: projectRoot, encoding: 'utf-8' }
    );
    res.json({ success: true, output: output.trim() });
  } catch (err) {
    res.status(500).json({ error: '提交失败', detail: err.message });
  }
}

function escapeShellArg(str) {
  return `'${str.replace(/'/g, "'\\''")}'`;
}

function parseDiff(diffText) {
  if (!diffText.trim()) return [];

  const lines = diffText.split('\n');
  const hunks = [];
  let currentHunk = null;

  for (const line of lines) {
    if (line.startsWith('@@')) {
      if (currentHunk) hunks.push(currentHunk);
      const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      currentHunk = {
        header: line,
        oldStart: match ? parseInt(match[1]) : 0,
        newStart: match ? parseInt(match[2]) : 0,
        lines: [],
      };
    } else if (currentHunk) {
      const type = line.startsWith('+') ? 'add' : line.startsWith('-') ? 'remove' : 'context';
      currentHunk.lines.push({ type, content: line.slice(1) || ' ' });
    }
  }
  if (currentHunk) hunks.push(currentHunk);

  return hunks;
}
