import React, { useState } from 'react';
import { Search, FileSearch, Type, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import FileIconByType from '../../components/FileIconByType';

export default function SearchTab({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('content');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const tabs = [
    { id: 'file', label: '文件名', icon: FileSearch },
    { id: 'content', label: '内容', icon: Search },
    { id: 'symbol', label: '符号', icon: Type },
    { id: 'git', label: 'Git', icon: History },
  ];

  const doSearch = (type?: string) => {
    const searchType = type || activeTab;
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    fetch(`/api/projects/${projectId}/search?q=${encodeURIComponent(query)}&type=${searchType}`)
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

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (query.trim()) {
      doSearch(tabId);
    } else {
      setSearched(false);
      setResults([]);
    }
  };

  const highlightMatch = (text: string, keyword: string) => {
    if (!keyword) return text;
    const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase()
        ? <span key={i} className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-200 px-0.5 rounded">{part}</span>
        : part
    );
  };

  const getDirPath = (filePath: string, fileName: string) => {
    const idx = filePath.lastIndexOf('/' + fileName);
    if (idx > 0) return filePath.substring(0, idx);
    const lastSlash = filePath.lastIndexOf('/');
    return lastSlash > 0 ? filePath.substring(0, lastSlash) : '';
  };

  const openFile = (filePath: string) => {
    navigate(`/workspace/${projectId}/code?file=${encodeURIComponent(filePath)}`);
  };

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <header className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">全局搜索</h2>
      </header>

      <div className="bg-white dark:bg-gray-800 px-2 pt-2 border-b border-gray-200 dark:border-gray-700 shrink-0 flex overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
              activeTab === t.id
                ? "border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700"
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
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
            className="w-full pl-10 pr-12 py-2.5 bg-gray-100 dark:bg-gray-700 border-transparent rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all outline-none text-sm"
          />
          {query.trim() && (
            <button
              onClick={() => doSearch()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
            >
              搜索
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">搜索中...</div>
        ) : searched ? (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">找到 {total} 个结果</div>

            {activeTab === 'git' ? (
              results.map((item: any, i: number) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">{item.hash}</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">{item.message}</span>
                  </div>
                </div>
              ))
            ) : activeTab === 'file' ? (
              results.map((item: any, i: number) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700 cursor-pointer"
                  onClick={() => openFile(item.filePath)}
                >
                  <div className="flex items-center gap-2">
                    <FileIconByType fileName={item.fileName} className="w-4 h-4 shrink-0" />
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{getDirPath(item.filePath, item.fileName)}/</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 shrink-0">{highlightMatch(item.fileName, query)}</span>
                  </div>
                </div>
              ))
            ) : (
              results.map((item: any, i: number) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700 cursor-pointer"
                  onClick={() => openFile(item.filePath)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileIconByType fileName={item.fileName} className="w-4 h-4 shrink-0" />
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{getDirPath(item.filePath, item.fileName)}/</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 shrink-0">{item.fileName}</span>
                  </div>
                  {item.matches && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 text-xs font-mono text-gray-600 dark:text-gray-400 overflow-x-auto">
                      {item.matches.map((m: any, j: number) => (
                        <div key={j} className="flex gap-3 py-0.5">
                          <span className="text-gray-400 dark:text-gray-500 select-none shrink-0">{m.lineNumber}</span>
                          <span className="truncate">{highlightMatch(m.line, query)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}

            {results.length === 0 && (
              <div className="text-center py-10 text-gray-400 dark:text-gray-500">未找到结果</div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 space-y-4">
            <Search className="w-12 h-12 text-gray-300" />
            <p className="text-sm">输入关键词开始搜索</p>
          </div>
        )}
      </div>
    </div>
  );
}
