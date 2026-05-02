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
    let diffOutput;
    try {
      diffOutput = execSync('git diff --cached', {
        cwd: projectRoot,
        encoding: 'utf-8',
        maxBuffer: 5 * 1024 * 1024,
      });
    } catch {
      diffOutput = '';
    }

    if (!diffOutput.trim()) {
      return res.status(400).json({ error: '没有已暂存的变更，请先暂存文件' });
    }

    const truncatedDiff = diffOutput.length > 8000
      ? diffOutput.slice(0, 8000) + '\n... (diff truncated)'
      : diffOutput;

    const prompt = `Based on the following git diff, generate a concise and clear commit message. Follow the Conventional Commits format if appropriate (e.g., "feat: add feature", "fix: resolve bug", "refactor: restructure code"). The commit message should be in the same language as the code comments. Do not include any explanation, just the commit message itself.

Git diff:
${truncatedDiff}`;

    const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
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
        max_tokens: 200,
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
    const message = (data.choices?.[0]?.message?.content || '').trim();

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
