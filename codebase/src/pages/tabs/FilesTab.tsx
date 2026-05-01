import React, { useState, useEffect } from 'react';
import { ChevronLeft, MoreVertical, ChevronRight, Folder as FolderIcon, File as FileIcon, Search, Star } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function FilesTab({ projectId, project }: { projectId: string; project: any }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dirPath = searchParams.get('path') || '';
  const [data, setData] = useState<{ folders: any[]; files: any[]; breadcrumbs: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/projects/${projectId}/files?path=${encodeURIComponent(dirPath)}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId, dirPath]);

  const projectName = project?.name || 'Project';
  const branch = project?.branch || 'main';

  const lowerFilter = filter.toLowerCase();
  const filteredFolders = data?.folders.filter(f => f.name.toLowerCase().includes(lowerFilter)) || [];
  const filteredFiles = data?.files.filter(f => f.name.toLowerCase().includes(lowerFilter)) || [];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/projects')} className="p-1 -ml-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">{projectName}</h2>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
              <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">{branch}</span>
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {data?.breadcrumbs && (
        <div className="bg-white dark:bg-gray-800 px-4 py-2.5 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 overflow-x-auto whitespace-nowrap shrink-0">
          {data.breadcrumbs.map((bc: any, i: number) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />}
              <span
                className={i === data.breadcrumbs.length - 1 ? 'text-gray-900 dark:text-gray-100' : 'text-blue-600 dark:text-blue-400 font-medium cursor-pointer'}
                onClick={() => {
                  if (i < data.breadcrumbs.length - 1) {
                    navigate(`/workspace/${projectId}?tab=files&path=${encodeURIComponent(bc.path)}`);
                  }
                }}
              >
                {bc.name}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="relative flex-1 mr-4">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="搜索文件..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm outline-none focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
            >
              <span className="text-xs">✕</span>
            </button>
          )}
        </div>
        <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-yellow-500 transition-colors">
          <Star className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
        {loading ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">加载中...</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredFolders.map((folder: any) => (
              <div
                key={folder.path}
                className="flex items-center gap-3 px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700 cursor-pointer"
                onClick={() => navigate(`/workspace/${projectId}?tab=files&path=${encodeURIComponent(folder.path)}`)}
              >
                <FolderIcon className="w-5 h-5 text-blue-400 dark:text-blue-300 fill-blue-100 dark:fill-blue-900/30 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{folder.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{folder.itemCount} 项</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              </div>
            ))}
            {filteredFiles.map((file: any) => (
              <div
                key={file.path}
                className="flex items-center gap-3 px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700 cursor-pointer"
                onClick={() => navigate(`/workspace/${projectId}/code?file=${encodeURIComponent(file.path)}`)}
              >
                <FileIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{file.size} · {file.modified}</div>
                </div>
              </div>
            ))}
            {filteredFolders.length === 0 && filteredFiles.length === 0 && (
              <div className="text-center py-10 text-gray-400 dark:text-gray-500">{filter ? '没有匹配的文件' : '空目录'}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
