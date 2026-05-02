import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, MoreVertical, Edit3, List, Search, Settings2 } from 'lucide-react';
import hljs from 'highlight.js';
import { useSettings } from '../lib/SettingsContext';

const EXT_LANG_MAP: Record<string, string> = {
  '.ts': 'typescript', '.tsx': 'typescript',
  '.js': 'javascript', '.jsx': 'javascript',
  '.css': 'css', '.scss': 'scss', '.less': 'less',
  '.html': 'xml', '.xml': 'xml', '.svg': 'xml',
  '.json': 'json', '.yaml': 'yaml', '.yml': 'yaml', '.toml': 'ini',
  '.md': 'markdown', '.py': 'python', '.go': 'go',
  '.rs': 'rust', '.java': 'java', '.sh': 'bash', '.sql': 'sql',
  '.c': 'c', '.cpp': 'cpp', '.h': 'c', '.hpp': 'cpp',
  '.rb': 'ruby', '.php': 'php', '.swift': 'swift',
  '.kt': 'kotlin', '.scala': 'scala', '.r': 'r',
  '.lua': 'lua', '.dart': 'dart', '.vue': 'xml',
  '.svelte': 'xml', '.graphql': 'graphql',
  '.tf': 'hcl', '.hcl': 'hcl',
  '.dockerfile': 'dockerfile',
  '.gitignore': 'plaintext', '.env': 'ini',
};

function detectLang(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower === 'dockerfile') return 'dockerfile';
  if (lower === 'makefile') return 'makefile';
  if (lower.endsWith('.gitignore')) return 'plaintext';
  const ext = '.' + lower.split('.').pop();
  return EXT_LANG_MAP[ext] || 'plaintext';
}

function highlightCode(code: string, lang: string): string {
  try {
    if (lang === 'plaintext') return escapeHtml(code);
    const result = hljs.highlight(code, { language: lang, ignoreIllegals: true });
    return result.value;
  } catch {
    return escapeHtml(code);
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function CodeViewer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fontSize } = useSettings();
  const fileName = searchParams.get('file') || '';
  const displayFileName = fileName.split('/').pop() || 'Unknown';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const projectId = window.location.pathname.split('/')[2];

  useEffect(() => {
    if (!fileName) return;
    setLoading(true);
    fetch(`/api/projects/${projectId}/code?file=${encodeURIComponent(fileName)}`)
      .then(res => {
        if (!res.ok) throw new Error('文件读取失败');
        return res.json();
      })
      .then(data => {
        setCode(data.content || '');
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [fileName, projectId]);

  const lang = useMemo(() => detectLang(displayFileName), [displayFileName]);
  const highlighted = useMemo(() => highlightCode(code, lang), [code, lang]);
  const lines = useMemo(() => highlighted.split('\n'), [highlighted]);

  const lineHeight = Math.round(fontSize * 1.5);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 flex flex-col">
      <header className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-base font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{displayFileName}</h2>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{lang}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <Edit3 className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto bg-[#fafafa] dark:bg-gray-900">
        {loading ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">加载中...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-400">{error}</div>
        ) : (
          <div className="flex min-w-max">
            <div className="w-12 shrink-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 py-4 text-right pr-3 select-none">
              {lines.map((_, i) => (
                <div key={i} className="text-gray-400 dark:text-gray-600 font-mono" style={{ fontSize: `${fontSize}px`, height: `${lineHeight}px`, lineHeight: `${lineHeight}px` }}>{i + 1}</div>
              ))}
            </div>
            <div className="flex-1 py-4 px-4">
              <pre className="font-mono m-0" style={{ fontSize: `${fontSize}px`, lineHeight: `${lineHeight}px` }}>
                <code className={`hljs language-${lang}`}>
                  {lines.map((line, i) => (
                    <div key={i} className="whitespace-pre" style={{ height: `${lineHeight}px` }} dangerouslySetInnerHTML={{ __html: line || ' ' }} />
                  ))}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-around shrink-0 pb-safe">
        <button className="p-2 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-600">
          <List className="w-5 h-5" />
          <span className="text-[10px]">大纲</span>
        </button>
        <button className="p-2 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-600">
          <Search className="w-5 h-5" />
          <span className="text-[10px]">搜索</span>
        </button>
        <button className="p-2 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-600">
          <Settings2 className="w-5 h-5" />
          <span className="text-[10px]">显示</span>
        </button>
      </div>
    </div>
  );
}
