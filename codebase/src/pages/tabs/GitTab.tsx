import React, { useState, useEffect, useCallback } from 'react';
import { GitBranch, Plus, Minus, Check, ChevronLeft, FileText, Columns2, Rows3, Sparkles } from 'lucide-react';
import { useSettings } from '../../lib/SettingsContext';

interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  oldLine: number | null;
  newLine: number | null;
}

interface DiffHunk {
  header: string;
  oldStart: number;
  newStart: number;
  lines: DiffLine[];
}

export default function GitTab({ projectId }: { projectId: string }) {
  const { diffView } = useSettings();
  const [viewMode, setViewMode] = useState<'unified' | 'split'>(diffView);
  const [data, setData] = useState<{ branch: string; staged: any[]; unstaged: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [diffData, setDiffData] = useState<{ filePath: string; type: string; hunks: DiffHunk[] } | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [commitMsg, setCommitMsg] = useState('');
  const [committing, setCommitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadStatus = useCallback(() => {
    fetch(`/api/projects/${projectId}/git/status`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const viewDiff = (filePath: string, type: string) => {
    setDiffLoading(true);
    fetch(`/api/projects/${projectId}/git/diff?file=${encodeURIComponent(filePath)}&type=${type}`)
      .then(res => res.json())
      .then(d => {
        setDiffData(d);
        setDiffLoading(false);
      })
      .catch(() => setDiffLoading(false));
  };

  const stageFile = (filePath: string) => {
    setActionLoading(`stage-${filePath}`);
    fetch(`/api/projects/${projectId}/git/stage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath }),
    })
      .then(() => { loadStatus(); setActionLoading(null); })
      .catch(() => setActionLoading(null));
  };

  const stageAll = () => {
    setActionLoading('stage-all');
    fetch(`/api/projects/${projectId}/git/stage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
      .then(() => { loadStatus(); setActionLoading(null); })
      .catch(() => setActionLoading(null));
  };

  const unstageFile = (filePath: string) => {
    setActionLoading(`unstage-${filePath}`);
    fetch(`/api/projects/${projectId}/git/unstage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath }),
    })
      .then(() => { loadStatus(); setActionLoading(null); })
      .catch(() => setActionLoading(null));
  };

  const unstageAll = () => {
    setActionLoading('unstage-all');
    fetch(`/api/projects/${projectId}/git/unstage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
      .then(() => { loadStatus(); setActionLoading(null); })
      .catch(() => setActionLoading(null));
  };

  const handleCommit = () => {
    if (!commitMsg.trim()) return;
    setCommitting(true);
    fetch(`/api/projects/${projectId}/git/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: commitMsg.trim() }),
    })
      .then(res => res.json())
      .then(data => {
        setCommitting(false);
        if (data.success) {
          setCommitMsg('');
          loadStatus();
        }
      })
      .catch(() => setCommitting(false));
  };

  const handleAiGenerate = () => {
    setAiGenerating(true);
    fetch(`/api/projects/${projectId}/git/ai-commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        setAiGenerating(false);
        if (data.message) {
          setCommitMsg(data.message);
        } else if (data.error) {
          alert(data.error);
        }
      })
      .catch(() => {
        setAiGenerating(false);
        alert('AI 生成失败，请检查网络连接和 API 配置');
      });
  };

  const statusColor = (status: string) => {
    if (status === 'M') return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    if (status === 'A') return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (status === 'D') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (status === 'U') return 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-700';
    return 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-700';
  };

  if (diffData) {
    const renderUnifiedView = () => (
      <div className="min-w-max">
        {diffData.hunks!.map((hunk, hi) => (
          <div key={hi}>
            <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-1 text-xs font-mono text-blue-600 dark:text-blue-400 border-b border-blue-100 dark:border-blue-800 sticky top-0 z-10">
              {hunk.header}
            </div>
            {hunk.lines.map((line, li) => {
              const isAdd = line.type === 'add';
              const isRemove = line.type === 'remove';
              return (
                <div
                  key={li}
                  className={`flex font-mono text-xs leading-5 ${isAdd ? 'bg-green-50 dark:bg-green-900/20' : isRemove ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-800'}`}
                >
                  <span className={`w-10 shrink-0 text-right pr-2 select-none sticky left-0 z-[5] ${isRemove ? 'text-red-300 dark:text-red-600 bg-red-50 dark:bg-red-900/20' : isAdd ? 'text-gray-300 dark:text-gray-600 bg-green-50 dark:bg-green-900/20' : 'text-gray-300 dark:text-gray-600 bg-white dark:bg-gray-800'} border-r border-gray-200 dark:border-gray-700`}>
                    {line.oldLine ?? ''}
                  </span>
                  <span className={`w-10 shrink-0 text-right pr-2 select-none ${isAdd ? 'text-green-300 dark:text-green-600' : isRemove ? 'text-red-300 dark:text-red-600' : 'text-gray-300 dark:text-gray-600'} border-r border-gray-200 dark:border-gray-700`}>
                    {line.newLine ?? ''}
                  </span>
                  <span className={`w-5 shrink-0 text-center select-none ${isAdd ? 'text-green-400 dark:text-green-500' : isRemove ? 'text-red-400 dark:text-red-500' : 'text-gray-300 dark:text-gray-600'}`}>
                    {isAdd ? '+' : isRemove ? '-' : ' '}
                  </span>
                  <pre className={`whitespace-pre px-1 ${isAdd ? 'text-green-800 dark:text-green-300' : isRemove ? 'text-red-800 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {line.content}
                  </pre>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );

    const renderSplitView = () => (
      <div>
        {diffData.hunks!.map((hunk, hi) => (
          <div key={hi}>
            <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-1 text-xs font-mono text-blue-600 dark:text-blue-400 border-b border-blue-100 dark:border-blue-800 sticky top-0 z-10">
              {hunk.header}
            </div>
            {hunk.lines.map((line, li) => {
              const isAdd = line.type === 'add';
              const isRemove = line.type === 'remove';
              return (
                <div key={li} className="flex font-mono text-xs leading-5">
                  <div className={`w-1/2 flex border-r border-gray-300 dark:border-gray-600 ${isRemove ? 'bg-red-50 dark:bg-red-900/20' : isAdd ? 'bg-gray-50 dark:bg-gray-900/30' : 'bg-white dark:bg-gray-800'}`}>
                    <span className={`w-10 shrink-0 text-right pr-2 select-none ${isRemove ? 'text-red-300 dark:text-red-600 bg-red-50 dark:bg-red-900/20' : isAdd ? 'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-900/30' : 'text-gray-300 dark:text-gray-600 bg-white dark:bg-gray-800'} border-r border-gray-200 dark:border-gray-700`}>
                      {line.oldLine ?? ''}
                    </span>
                    <pre className={`whitespace-pre px-1 flex-1 min-w-0 ${isRemove ? 'text-red-800 dark:text-red-300' : isAdd ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
                      {isRemove ? line.content : isAdd ? '' : line.content}
                    </pre>
                  </div>
                  <div className={`w-1/2 flex ${isAdd ? 'bg-green-50 dark:bg-green-900/20' : isRemove ? 'bg-gray-50 dark:bg-gray-900/30' : 'bg-white dark:bg-gray-800'}`}>
                    <span className={`w-10 shrink-0 text-right pr-2 select-none ${isAdd ? 'text-green-300 dark:text-green-600 bg-green-50 dark:bg-green-900/20' : isRemove ? 'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-900/30' : 'text-gray-300 dark:text-gray-600 bg-white dark:bg-gray-800'} border-r border-gray-200 dark:border-gray-700`}>
                      {line.newLine ?? ''}
                    </span>
                    <pre className={`whitespace-pre px-1 flex-1 min-w-0 ${isAdd ? 'text-green-800 dark:text-green-300' : isRemove ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
                      {isAdd ? line.content : isRemove ? '' : line.content}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );

    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0 flex items-center gap-3">
          <button onClick={() => setDiffData(null)} className="p-1 -ml-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{diffData.filePath}</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">{diffData.type === 'staged' ? '已暂存的变更' : '未暂存的变更'}</span>
          </div>
          <button
            onClick={() => setViewMode(m => m === 'unified' ? 'split' : 'unified')}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title={viewMode === 'unified' ? '切换为分栏视图' : '切换为合并视图'}
          >
            {viewMode === 'unified' ? <Columns2 className="w-4 h-4" /> : <Rows3 className="w-4 h-4" />}
          </button>
        </header>

        <div className="flex-1 overflow-auto">
          {diffLoading ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">加载中...</div>
          ) : diffData.hunks!.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">无变更内容</div>
          ) : viewMode === 'unified' ? renderUnifiedView() : renderSplitView()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Git 变更</h2>
        {data?.branch && (
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-md">
            <GitBranch className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{data.branch}</span>
          </div>
        )}
      </header>

      {loading ? (
        <div className="text-center py-10 text-gray-400 dark:text-gray-500">加载中...</div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {data?.staged && data.staged.length > 0 && (
            <div className="mb-4">
              <div className="px-4 py-2 flex items-center justify-between bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                <h3 className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">已暂存的变更 ({data.staged.length})</h3>
                <button
                  onClick={unstageAll}
                  disabled={actionLoading === 'unstage-all'}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50"
                >
                  全部取消
                </button>
              </div>
              <div className="bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                {data.staged.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2.5">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 border ${statusColor(item.status)}`}>{item.status}</span>
                    <button
                      onClick={() => viewDiff(item.filePath, 'staged')}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="text-sm text-gray-900 dark:text-gray-100 truncate hover:text-blue-600 dark:hover:text-blue-400">{item.filePath}</div>
                    </button>
                    <button
                      onClick={() => unstageFile(item.filePath)}
                      disabled={actionLoading === `unstage-${item.filePath}`}
                      className="p-1.5 text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 rounded-md disabled:opacity-50 shrink-0"
                      title="取消暂存"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data?.unstaged && data.unstaged.length > 0 && (
            <div className="mb-4">
              <div className="px-4 py-2 flex items-center justify-between bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                <h3 className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">未暂存的变更 ({data.unstaged.length})</h3>
                <button
                  onClick={stageAll}
                  disabled={actionLoading === 'stage-all'}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50"
                >
                  全部暂存
                </button>
              </div>
              <div className="bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                {data.unstaged.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2.5">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 border ${statusColor(item.status)}`}>{item.status}</span>
                    <button
                      onClick={() => item.status !== 'U' ? viewDiff(item.filePath, 'unstaged') : undefined}
                      className={`flex-1 min-w-0 text-left ${item.status !== 'U' ? 'hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                    >
                      <div className="text-sm text-gray-900 dark:text-gray-100 truncate">{item.filePath}</div>
                    </button>
                    <button
                      onClick={() => stageFile(item.filePath)}
                      disabled={actionLoading === `stage-${item.filePath}`}
                      className="p-1.5 text-gray-400 dark:text-gray-500 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-500 dark:hover:text-green-400 rounded-md disabled:opacity-50 shrink-0"
                      title="暂存"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && data?.staged?.length === 0 && data?.unstaged?.length === 0 && (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">工作区干净，没有变更</div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shrink-0">
        <div className="relative mb-3">
          <textarea
            placeholder="输入提交信息..."
            value={commitMsg}
            onChange={e => setCommitMsg(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 pr-10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-transparent"
            rows={3}
          />
          <button
            onClick={handleAiGenerate}
            disabled={aiGenerating || (data?.staged?.length || 0) === 0}
            className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all ${
              aiGenerating
                ? 'text-purple-400 dark:text-purple-500 animate-pulse'
                : 'text-gray-400 dark:text-gray-500 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
            title="AI 生成提交信息"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleCommit}
          disabled={committing || !commitMsg.trim() || (data?.staged?.length || 0) === 0}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          {committing ? '提交中...' : '提交 (Commit)'}
        </button>
      </div>
    </div>
  );
}
