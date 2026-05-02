import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Folder, Search, GitBranch, Settings, ChevronLeft, MoreVertical, Copy, Check, Type, X, List, Home } from 'lucide-react';
import hljs from 'highlight.js';
import { cn } from '../lib/utils';
import { useSettings } from '../lib/SettingsContext';
import FilesTab from './tabs/FilesTab';
import SearchTab from './tabs/SearchTab';
import GitTab from './tabs/GitTab';
import SettingsTab from './tabs/SettingsTab';

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
  } catch { return escapeHtml(code); }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parsePath(wildcard: string): { projectPath: string; filePath: string; isBlob: boolean } {
  const blobIdx = wildcard.indexOf('/blob/');
  if (blobIdx >= 0) {
    return {
      projectPath: '/' + wildcard.slice(0, blobIdx),
      filePath: wildcard.slice(blobIdx + 6),
      isBlob: true,
    };
  }
  if (wildcard.startsWith('blob/')) {
    return { projectPath: '', filePath: wildcard.slice(5), isBlob: true };
  }
  return { projectPath: '/' + wildcard, filePath: '', isBlob: false };
}

export default function Workspace() {
  const params = useParams();
  const wildcard = params['*'] || '';
  const { projectPath, filePath, isBlob } = parsePath(wildcard);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = searchParams.get('tab') || 'files';
  const [project, setProject] = useState<any>(null);

  const projectId = projectPath.replace(/^\//, '');

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}`)
      .then(res => res.json())
      .then(setProject)
      .catch(() => {});
  }, [projectId]);

  const basePath = `/p/${wildcard.split('/blob/')[0] || wildcard}`;

  const tabs = [
    { id: 'files', label: '文件', icon: Folder },
    { id: 'search', label: '搜索', icon: Search },
    { id: 'git', label: 'Git', icon: GitBranch },
    { id: 'settings', label: '设置', icon: Settings },
  ];

  if (isBlob) {
    return <CodeViewerInline projectId={projectId} filePath={filePath} projectPath={projectPath} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 flex flex-col">
      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === 'files' && <FilesTab projectId={projectId} project={project} basePath={basePath} />}
        {tab === 'search' && <SearchTab projectId={projectId} basePath={basePath} />}
        {tab === 'git' && <GitTab projectId={projectId} />}
        {tab === 'settings' && <SettingsTab />}
      </div>

      <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe">
        <div className="flex items-center justify-around h-14">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => navigate(`${basePath}?tab=${t.id}`)}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "fill-blue-50 dark:fill-blue-900/30")} />
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function CodeViewerInline({ projectId, filePath, projectPath }: { projectId: string; filePath: string; projectPath: string }) {
  const navigate = useNavigate();
  const params = useParams();
  const wildcard = params['*'] || '';
  const { fontSize, setFontSize } = useSettings();

  const displayFileName = filePath.split('/').pop() || 'Unknown';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentResult, setCurrentResult] = useState(0);
  const [isImage, setIsImage] = useState(false);

  const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.ico']);

  const fileIsImage = IMAGE_EXTS.has('.' + (displayFileName.split('.').pop() || '').toLowerCase());

  useEffect(() => {
    if (!filePath) return;
    setLoading(true);
    fetch(`/api/projects/${projectId}/code?file=${encodeURIComponent(filePath)}`)
      .then(res => {
        if (!res.ok) throw new Error('文件读取失败');
        return res.json();
      })
      .then(data => {
        if (data.image) {
          setIsImage(true);
          setCode('');
        } else {
          setIsImage(false);
          setCode(data.content || '');
        }
        setLoading(false);
        setTimeout(() => {
          const hash = window.location.hash;
          const match = hash.match(/^#L(\d+)$/);
          if (match) {
            const lineNum = parseInt(match[1], 10) - 1;
            const el = document.getElementById(`line-${lineNum}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [filePath, projectId]);

  const lang = useMemo(() => detectLang(displayFileName), [displayFileName]);
  const highlighted = useMemo(() => highlightCode(code, lang), [code, lang]);
  const lines = useMemo(() => highlighted.split('\n'), [highlighted]);
  const lineHeight = Math.round(fontSize * 1.5);

  const copyPath = () => {
    const fullPath = projectPath && filePath ? `${projectPath}/${filePath}` : filePath;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullPath).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = fullPath;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const doSearch = (query: string) => {
    if (!query.trim()) { setSearchResults([]); setCurrentResult(0); return; }
    const lower = query.toLowerCase();
    const results: number[] = [];
    code.split('\n').forEach((line, i) => {
      if (line.toLowerCase().includes(lower)) results.push(i);
    });
    setSearchResults(results);
    setCurrentResult(results.length > 0 ? 1 : 0);
  };

  const scrollToResult = (idx: number) => {
    const el = document.getElementById(`line-${idx}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const goNext = () => {
    if (searchResults.length === 0) return;
    const next = currentResult >= searchResults.length ? 1 : currentResult + 1;
    setCurrentResult(next);
    scrollToResult(searchResults[next - 1]);
  };

  const goPrev = () => {
    if (searchResults.length === 0) return;
    const prev = currentResult <= 1 ? searchResults.length : currentResult - 1;
    setCurrentResult(prev);
    scrollToResult(searchResults[prev - 1]);
  };

  const basePath = `/p/${wildcard.split('/blob/')[0] || wildcard}`;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 flex flex-col">
      <header className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`${basePath}?tab=files`)} className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={() => navigate('/projects')} className="p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title="返回项目列表">
            <Home className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{displayFileName}</h2>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{lang}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowSearch(true)} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <Search className="w-5 h-5" />
          </button>
          <div className="relative">
            <button onClick={() => setShowMenu(m => !m)} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 min-w-[160px] py-1 overflow-hidden">
                  <button onClick={() => { copyPath(); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? '已复制' : '复制路径'}
                  </button>
                  <button onClick={() => { setShowFontPicker(true); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Type className="w-4 h-4" /> 字体大小
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {showSearch && (
        <div className="bg-white dark:bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); doSearch(e.target.value); }} placeholder="搜索内容..." className="flex-1 bg-transparent text-sm outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400" autoFocus />
          {searchResults.length > 0 && <span className="text-xs text-gray-400 shrink-0">{currentResult}/{searchResults.length}</span>}
          {searchResults.length > 1 && (<><button onClick={goPrev} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">↑</button><button onClick={goNext} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">↓</button></>)}
          <button onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-[#fafafa] dark:bg-gray-900">
        {loading ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">加载中...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-400">{error}</div>
        ) : isImage ? (
          <div className="flex items-center justify-center p-4">
            <img
              src={`/api/projects/${projectId}/raw?file=${encodeURIComponent(filePath)}`}
              alt={displayFileName}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm"
            />
          </div>
        ) : (
          <div className="flex min-w-max">
            <div className="w-12 shrink-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 py-4 text-right pr-3 select-none">
              {lines.map((_, i) => (
                <div key={i} id={`line-${i}`} className="text-gray-400 dark:text-gray-600 font-mono" style={{ fontSize: `${fontSize}px`, height: `${lineHeight}px`, lineHeight: `${lineHeight}px` }}>{i + 1}</div>
              ))}
            </div>
            <div className="flex-1 py-4 px-4">
              <pre className="font-mono m-0" style={{ fontSize: `${fontSize}px`, lineHeight: `${lineHeight}px` }}>
                <code className={`hljs language-${lang}`}>
                  {lines.map((line, i) => (
                    <div key={i} id={`line-content-${i}`} className={`whitespace-pre ${searchResults.includes(i) ? 'bg-yellow-200/50 dark:bg-yellow-700/30' : ''}`} style={{ height: `${lineHeight}px` }} dangerouslySetInnerHTML={{ __html: line || ' ' }} />
                  ))}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-around shrink-0 pb-safe">
        {!isImage && <button onClick={() => setShowSearch(true)} className="p-2 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-600"><Search className="w-5 h-5" /><span className="text-[10px]">搜索</span></button>}
        {!isImage && <button onClick={() => setShowFontPicker(true)} className="p-2 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-600"><Type className="w-5 h-5" /><span className="text-[10px]">字体</span></button>}
        <button onClick={() => navigate(`${basePath}?tab=files`)} className="p-2 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-600"><List className="w-5 h-5" /><span className="text-[10px]">返回</span></button>
      </div>

      {showFontPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowFontPicker(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-lg p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">字体大小</h3>
              <button onClick={() => setShowFontPicker(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => setFontSize(Math.max(10, fontSize - 1))} disabled={fontSize <= 10} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-30 active:scale-95 transition-all text-lg font-bold">-</button>
              <div className="text-center min-w-[60px]"><div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{fontSize}</div><div className="text-xs text-gray-400 dark:text-gray-500">px</div></div>
              <button onClick={() => setFontSize(Math.min(24, fontSize + 1))} disabled={fontSize >= 24} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-30 active:scale-95 transition-all text-lg font-bold">+</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
