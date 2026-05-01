import React from 'react';
import { GitBranch, GitCommit, Plus, Minus, Check } from 'lucide-react';

export default function GitTab() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white px-4 py-3 border-b border-gray-200 shrink-0 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Git 变更</h2>
        <div className="flex items-center gap-2 bg-gray-100 px-2.5 py-1 rounded-md">
          <GitBranch className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">main</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Staged Changes */}
        <div className="mb-4">
          <div className="px-4 py-2 flex items-center justify-between bg-gray-50 sticky top-0">
            <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wider">已暂存的变更 (1)</h3>
            <button className="text-xs text-gray-500 hover:text-gray-900">全部取消</button>
          </div>
          <div className="bg-white border-y border-gray-200 divide-y divide-gray-100">
            <div className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-[10px] font-mono text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded shrink-0">M</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 truncate">src/utils/api.ts</div>
              </div>
              <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md">
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Unstaged Changes */}
        <div className="mb-4">
          <div className="px-4 py-2 flex items-center justify-between bg-gray-50 sticky top-0">
            <h3 className="text-xs font-semibold text-orange-600 uppercase tracking-wider">未暂存的变更 (2)</h3>
            <button className="text-xs text-gray-500 hover:text-gray-900">全部暂存</button>
          </div>
          <div className="bg-white border-y border-gray-200 divide-y divide-gray-100">
            <div className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-[10px] font-mono text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded shrink-0">M</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 truncate">src/components/Button.tsx</div>
              </div>
              <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-[10px] font-mono text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded shrink-0">U</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 truncate">src/components/NewFeature.tsx</div>
              </div>
              <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

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