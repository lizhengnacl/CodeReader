import React from 'react';
import { ChevronLeft, MoreVertical, ChevronRight, Folder as FolderIcon, File as FileIcon, Search, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FilesTab({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/projects')} className="p-1 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 leading-tight">frontend-web</h2>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">main</span>
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-white px-4 py-2.5 flex items-center gap-1.5 text-sm text-gray-600 border-b border-gray-200 overflow-x-auto whitespace-nowrap shrink-0">
        <span className="text-blue-600 font-medium cursor-pointer">frontend-web</span>
        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="text-blue-600 font-medium cursor-pointer">src</span>
        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="text-gray-900">components</span>
      </div>

      {/* Quick Jump & Bookmarks */}
      <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2 text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg flex-1 mr-4">
          <Search className="w-4 h-4" />
          <span className="text-sm">搜索文件...</span>
        </div>
        <button className="p-2 text-gray-400 hover:text-yellow-500 transition-colors">
          <Star className="w-5 h-5" />
        </button>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="divide-y divide-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 active:bg-gray-50 cursor-pointer">
            <FolderIcon className="w-5 h-5 text-blue-400 fill-blue-100 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">ui</div>
              <div className="text-xs text-gray-500 mt-0.5">12 项</div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </div>
          <div className="flex items-center gap-3 px-4 py-3 active:bg-gray-50 cursor-pointer">
            <FolderIcon className="w-5 h-5 text-blue-400 fill-blue-100 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">hooks</div>
              <div className="text-xs text-gray-500 mt-0.5">5 项</div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </div>
          <div 
            className="flex items-center gap-3 px-4 py-3 active:bg-gray-50 cursor-pointer"
            onClick={() => navigate(`/workspace/${projectId}/code?file=Button.tsx`)}
          >
            <FileIcon className="w-5 h-5 text-gray-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">Button.tsx</div>
              <div className="text-xs text-gray-500 mt-0.5">2.4 KB · 2小时前</div>
            </div>
            <span className="text-[10px] font-mono text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded shrink-0">M</span>
          </div>
          <div 
            className="flex items-center gap-3 px-4 py-3 active:bg-gray-50 cursor-pointer"
            onClick={() => navigate(`/workspace/${projectId}/code?file=index.ts`)}
          >
            <FileIcon className="w-5 h-5 text-gray-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">index.ts</div>
              <div className="text-xs text-gray-500 mt-0.5">1.1 KB · 昨天</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}