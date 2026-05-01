import React, { useState } from 'react';
import { Search, FileText, Type, History, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function SearchTab() {
  const [activeTab, setActiveTab] = useState('content');
  const [query, setQuery] = useState('');

  const tabs = [
    { id: 'file', label: '文件名', icon: FileText },
    { id: 'content', label: '内容', icon: Search },
    { id: 'symbol', label: '符号', icon: Type },
    { id: 'git', label: 'Git', icon: History },
  ];

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
            onClick={() => setActiveTab(t.id)}
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
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-sm"
          />
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {query ? (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 mb-2">找到 2 个结果</div>
            
            {/* Mock Result 1 */}
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">src/components/</span>
                <span className="text-sm font-medium text-gray-900">Button.tsx</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-xs font-mono text-gray-600 overflow-x-auto">
                <div className="flex gap-3">
                  <span className="text-gray-400 select-none">42</span>
                  <span>export const <span className="bg-yellow-200 text-yellow-900 px-0.5 rounded">Button</span> = (props) =&gt; {'{'}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-400 select-none">43</span>
                  <span>  return &lt;button className="btn"&gt;...&lt;/button&gt;;</span>
                </div>
              </div>
            </div>

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