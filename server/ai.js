import { execSync } from 'child_process';
import { getProjectPath } from './projects.js';

export async function aiCommitMessage(req, res) {
  const { projectId } = req.params;
  const projectRoot = getProjectPath(projectId);

  if (!projectRoot) {
    return res.status(404).json({ error: '项目不存在' });
  }

  const apiKey = process.env.AI_API_KEY || '';
  const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    return res.status(400).json({ error: '未配置 AI_API_KEY，请在 .env 文件中配置' });
  }

  try {
    let diffOutput = '';
    let diffType = '';

    try {
      diffOutput = execSync('git diff --cached', {
        cwd: projectRoot,
        encoding: 'utf-8',
        maxBuffer: 5 * 1024 * 1024,
      });
      if (diffOutput.trim()) diffType = 'staged';
    } catch { /* no staged changes */ }

    if (!diffOutput.trim()) {
      try {
        diffOutput = execSync('git diff', {
          cwd: projectRoot,
          encoding: 'utf-8',
          maxBuffer: 5 * 1024 * 1024,
        });
        if (diffOutput.trim()) diffType = 'unstaged';
      } catch { /* no unstaged changes */ }
    }

    if (!diffOutput.trim()) {
      return res.status(400).json({ error: '没有变更内容，无法生成提交信息' });
    }

    const truncatedDiff = diffOutput.length > 8000
      ? diffOutput.slice(0, 8000) + '\n... (diff truncated)'
      : diffOutput;

    const prompt = `Based on the following git diff, generate a concise and clear commit message. Follow the Conventional Commits format if appropriate (e.g., "feat: add feature", "fix: resolve bug", "refactor: restructure code"). The commit message should be in the same language as the code comments. Do not include any explanation, just the commit message itself.

Git diff:
${truncatedDiff}`;

    let baseEndpoint = baseUrl.replace(/\/+$/, '');
    if (!baseEndpoint.endsWith('/v1') && !baseEndpoint.endsWith('/v2')) {
      baseEndpoint += '/v1';
    }
    const url = `${baseEndpoint}/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates concise git commit messages based on code diffs. Output only the commit message, nothing else.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(response.status).json({
        error: `AI API 请求失败 (${response.status})`,
        detail: errText,
      });
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;
    let message = (choice?.content || '').trim();

    if (!message && choice?.reasoning_content) {
      const reasoning = choice.reasoning_content;
      const lines = reasoning.split('\n').filter(l => l.trim());
      const lastLine = lines[lines.length - 1] || '';
      const match = lastLine.match(/(?:feat|fix|refactor|docs|style|test|chore|perf|build|ci|revert)(?:\(.+\))?:\s*.+/i)
        || lastLine.match(/^["']?(.+?)["']?$/);
      if (match) {
        message = match[0].replace(/^["']|["']$/g, '').trim();
      } else {
        message = lastLine.replace(/^["']|["']$/g, '').trim();
      }
    }

    if (!message) {
      return res.status(500).json({ error: 'AI 未返回有效的提交信息' });
    }

    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: '生成提交信息失败', detail: err.message });
  }
}

export function getAiConfig(req, res) {
  const apiKey = process.env.AI_API_KEY || '';
  const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  res.json({
    apiKey: apiKey ? '****' + apiKey.slice(-4) : '',
    baseUrl,
    model,
    configured: !!apiKey,
  });
}
