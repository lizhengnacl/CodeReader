import React, { useState, useEffect, useCallback } from 'react';
import { GitBranch, Plus, Minus, Check, ChevronLeft, FileText } from 'lucide-react';

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
  const [data, setData] = useState<{ branch: string; staged: any[]; unstaged: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [diffData, setDiffData] = useState<{ filePath: string; type: string; hunks: DiffHunk[] } | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [commitMsg, setCommitMsg] = useState('');
  const [committing, setCommitting] = useState(false);
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

  const statusColor = (status: string) => {
    if (status === 'M') return 'text-orange-600 bg-orange-50 border-orange-200';
    if (status === 'A') return 'text-green-600 bg-green-50 border-green-200';
    if (status === 'D') return 'text-red-600 bg-red-50 border-red-200';
    if (status === 'U') return 'text-gray-500 bg-gray-100 border-gray-200';
    return 'text-gray-500 bg-gray-100 border-gray-200';
  };

  // Diff detail view
  if (diffData) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <header className="bg-white px-4 py-3 border-b border-gray-200 shrink-0 flex items-center gap-3">
          <button onClick={() => setDiffData(null)} className="p-1 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate">{diffData.filePath}</h2>
            <span className="text-xs text-gray-500">{diffData.type === 'staged' ? '已暂存的变更' : '未暂存的变更'}</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {diffLoading ? (
            <div className="text-center py-10 text-gray-400">加载中...</div>
          ) : diffData.hunks.length === 0 ? (
            <div className="text-center py-10 text-gray-400">无变更内容</div>
          ) : (
            <div className="min-w-max">
            {diffData.hunks.map((hunk, hi) => (
              <div key={hi}>
                <div className="bg-blue-50 px-4 py-1 text-xs font-mono text-blue-600 border-b border-blue-100 sticky top-0 z-10">
                  {hunk.header}
                </div>
                {hunk.lines.map((line, li) => {
                  const isAdd = line.type === 'add';
                  const isRemove = line.type === 'remove';
                  return (
                    <div
                      key={li}
                      className={`flex font-mono text-xs leading-5 ${isAdd ? 'bg-green-50' : isRemove ? 'bg-red-50' : 'bg-white'}`}
                    >
                      <span className={`w-10 shrink-0 text-right pr-2 select-none sticky left-0 z-[5] ${isRemove ? 'text-red-300 bg-red-50' : isAdd ? 'text-gray-300 bg-green-50' : 'text-gray-300 bg-white'} border-r border-gray-200`}>
                        {line.oldLine ?? ''}
                      </span>
                      <span className={`w-10 shrink-0 text-right pr-2 select-none ${isAdd ? 'text-green-300' : isRemove ? 'text-red-300' : 'text-gray-300'} border-r border-gray-200`}>
                        {line.newLine ?? ''}
                      </span>
                      <span className={`w-5 shrink-0 text-center select-none ${isAdd ? 'text-green-400' : isRemove ? 'text-red-400' : 'text-gray-300'}`}>
                        {isAdd ? '+' : isRemove ? '-' : ' '}
                      </span>
                      <pre className={`whitespace-pre px-1 ${isAdd ? 'text-green-800' : isRemove ? 'text-red-800' : 'text-gray-700'}`}>
                        {line.content}
                      </pre>
                    </div>
                  );
                })}
              </div>
            ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white px-4 py-3 border-b border-gray-200 shrink-0 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Git 变更</h2>
        {data?.branch && (
          <div className="flex items-center gap-2 bg-gray-100 px-2.5 py-1 rounded-md">
            <GitBranch className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{data.branch}</span>
          </div>
        )}
      </header>

      {loading ? (
        <div className="text-center py-10 text-gray-400">加载中...</div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Staged Changes */}
          {data?.staged && data.staged.length > 0 && (
            <div className="mb-4">
              <div className="px-4 py-2 flex items-center justify-between bg-gray-50 sticky top-0 z-10">
                <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wider">已暂存的变更 ({data.staged.length})</h3>
                <button
                  onClick={unstageAll}
                  disabled={actionLoading === 'unstage-all'}
                  className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-50"
                >
                  全部取消
                </button>
              </div>
              <div className="bg-white border-y border-gray-200 divide-y divide-gray-100">
                {data.staged.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2.5">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 border ${statusColor(item.status)}`}>{item.status}</span>
                    <button
                      onClick={() => viewDiff(item.filePath, 'staged')}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="text-sm text-gray-900 truncate hover:text-blue-600">{item.filePath}</div>
                    </button>
                    <button
                      onClick={() => unstageFile(item.filePath)}
                      disabled={actionLoading === `unstage-${item.filePath}`}
                      className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-md disabled:opacity-50 shrink-0"
                      title="取消暂存"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unstaged Changes */}
          {data?.unstaged && data.unstaged.length > 0 && (
            <div className="mb-4">
              <div className="px-4 py-2 flex items-center justify-between bg-gray-50 sticky top-0 z-10">
                <h3 className="text-xs font-semibold text-orange-600 uppercase tracking-wider">未暂存的变更 ({data.unstaged.length})</h3>
                <button
                  onClick={stageAll}
                  disabled={actionLoading === 'stage-all'}
                  className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-50"
                >
                  全部暂存
                </button>
              </div>
              <div className="bg-white border-y border-gray-200 divide-y divide-gray-100">
                {data.unstaged.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2.5">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 border ${statusColor(item.status)}`}>{item.status}</span>
                    <button
                      onClick={() => item.status !== 'U' ? viewDiff(item.filePath, 'unstaged') : undefined}
                      className={`flex-1 min-w-0 text-left ${item.status !== 'U' ? 'hover:text-blue-600' : ''}`}
                    >
                      <div className="text-sm text-gray-900 truncate">{item.filePath}</div>
                    </button>
                    <button
                      onClick={() => stageFile(item.filePath)}
                      disabled={actionLoading === `stage-${item.filePath}`}
                      className="p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-500 rounded-md disabled:opacity-50 shrink-0"
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
            <div className="text-center py-10 text-gray-400">工作区干净，没有变更</div>
          )}
        </div>
      )}

      {/* Commit Area */}
      <div className="bg-white border-t border-gray-200 p-4 shrink-0">
        <textarea
          placeholder="输入提交信息..."
          value={commitMsg}
          onChange={e => setCommitMsg(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
          rows={3}
        />
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
