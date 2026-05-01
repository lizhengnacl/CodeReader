import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, Minus, Check } from 'lucide-react';

export default function GitTab({ projectId }: { projectId: string }) {
  const [data, setData] = useState<{ branch: string; staged: any[]; unstaged: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/git/status`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      'M': '修改',
      'A': '新增',
      'D': '删除',
      'R': '重命名',
      'C': '复制',
      'U': '未跟踪',
      'I': '忽略',
    };
    return map[status] || status;
  };

  const statusColor = (status: string) => {
    if (status === 'M') return 'text-orange-600 bg-orange-50 border-orange-200';
    if (status === 'A') return 'text-green-600 bg-green-50 border-green-200';
    if (status === 'D') return 'text-red-600 bg-red-50 border-red-200';
    if (status === 'U') return 'text-gray-500 bg-gray-100 border-gray-200';
    return 'text-gray-500 bg-gray-100 border-gray-200';
  };

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
              <div className="px-4 py-2 flex items-center justify-between bg-gray-50 sticky top-0">
                <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wider">已暂存的变更 ({data.staged.length})</h3>
                <button className="text-xs text-gray-500 hover:text-gray-900">全部取消</button>
              </div>
              <div className="bg-white border-y border-gray-200 divide-y divide-gray-100">
                {data.staged.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 border ${statusColor(item.status)}`}>{item.status}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900 truncate">{item.filePath}</div>
                    </div>
                    <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md">
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
              <div className="px-4 py-2 flex items-center justify-between bg-gray-50 sticky top-0">
                <h3 className="text-xs font-semibold text-orange-600 uppercase tracking-wider">未暂存的变更 ({data.unstaged.length})</h3>
                <button className="text-xs text-gray-500 hover:text-gray-900">全部暂存</button>
              </div>
              <div className="bg-white border-y border-gray-200 divide-y divide-gray-100">
                {data.unstaged.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 border ${statusColor(item.status)}`}>{item.status}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900 truncate">{item.filePath}</div>
                    </div>
                    <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md">
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
          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
          rows={3}
        />
        <button className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all">
          <Check className="w-4 h-4" />
          提交 (Commit)
        </button>
      </div>
    </div>
  );
}
