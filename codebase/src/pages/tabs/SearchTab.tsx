import React, { useState } from 'react';
import { Search, FileText, Type, History, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function SearchTab({ projectId }: { projectId: string }) {
  const [activeTab, setActiveTab] = useState('content');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const tabs = [
    { id: 'file', label: '文件名', icon: FileText },
    { id: 'content', label: '内容', icon: Search },
    { id: 'symbol', label: '符号', icon: Type },
    { id: 'git', label: 'Git', icon: History },
  ];

  const doSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    fetch(`/api/projects/${projectId}/search?q=${encodeURIComponent(query)}&type=${activeTab}`)
      .then(res => res.json())
      .then(data => {
        setResults(data.results || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doSearch();
  };

  const highlightMatch = (text: string, keyword: string) => {
    if (!keyword) return text;
    const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase()
        ? <span key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{part}</span>
        : part
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white px-4 py-3 border-b border-gray-200 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">全局搜索</h2>
      </header>

      {/* Search Type Tabs */}
      <div className="bg-white px-2 pt-2 border-b border-gray-200 shrink-0 flex overflow-x-auto hide-scrollbar">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setSearched(false); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
              activeTab === t.id 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 border-b border-gray-200 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'file' ? '搜索文件名...' :
              activeTab === 'content' ? '搜索代码内容...' :
              activeTab === 'symbol' ? '搜索函数/类定义...' :
              '搜索提交记录...'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-sm"
          />
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {loading ? (
          <div className="text-center py-10 text-gray-400">搜索中...</div>
        ) : searched && query ? (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 mb-2">找到 {total} 个结果</div>
            
            {activeTab === 'git' ? (
              results.map((item: any, i: number) => (
                <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{item.hash}</span>
                    <span className="text-sm text-gray-900">{item.message}</span>
                  </div>
                </div>
              ))
            ) : activeTab === 'file' ? (
              results.map((item: any, i: number) => (
                <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{item.filePath.replace(`/${item.fileName}`, '')}/</span>
                    <span className="text-sm font-medium text-gray-900">{highlightMatch(item.fileName, query)}</span>
                  </div>
                </div>
              ))
            ) : (
              results.map((item: any, i: number) => (
                <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{item.filePath.replace(`/${item.fileName}`, '')}/</span>
                    <span className="text-sm font-medium text-gray-900">{item.fileName}</span>
                  </div>
                  {item.matches && (
                    <div className="bg-gray-50 rounded-lg p-2 text-xs font-mono text-gray-600 overflow-x-auto">
                      {item.matches.map((m: any, j: number) => (
                        <div key={j} className="flex gap-3">
                          <span className="text-gray-400 select-none">{m.lineNumber}</span>
                          <span>{highlightMatch(m.line, query)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}

            {results.length === 0 && (
              <div className="text-center py-10 text-gray-400">未找到结果</div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <Search className="w-12 h-12 text-gray-300" />
            <p className="text-sm">输入关键词开始搜索</p>
          </div>
        )}
      </div>
    </div>
  );
}
