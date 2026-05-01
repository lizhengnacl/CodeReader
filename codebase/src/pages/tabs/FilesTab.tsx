import React, { useState, useEffect } from 'react';
import { ChevronLeft, MoreVertical, ChevronRight, Folder as FolderIcon, File as FileIcon, Search, Star } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function FilesTab({ projectId, project }: { projectId: string; project: any }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dirPath = searchParams.get('path') || '';
  const [data, setData] = useState<{ folders: any[]; files: any[]; breadcrumbs: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/projects')} className="p-1 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 leading-tight">{projectName}</h2>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{branch}</span>
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Breadcrumbs */}
      {data?.breadcrumbs && (
        <div className="bg-white px-4 py-2.5 flex items-center gap-1.5 text-sm text-gray-600 border-b border-gray-200 overflow-x-auto whitespace-nowrap shrink-0">
          {data.breadcrumbs.map((bc: any, i: number) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
              <span
                className={i === data.breadcrumbs.length - 1 ? 'text-gray-900' : 'text-blue-600 font-medium cursor-pointer'}
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
        {loading ? (
          <div className="text-center py-10 text-gray-400">加载中...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data?.folders.map((folder: any) => (
              <div
                key={folder.path}
                className="flex items-center gap-3 px-4 py-3 active:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/workspace/${projectId}?tab=files&path=${encodeURIComponent(folder.path)}`)}
              >
                <FolderIcon className="w-5 h-5 text-blue-400 fill-blue-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{folder.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{folder.itemCount} 项</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </div>
            ))}
            {data?.files.map((file: any) => (
              <div
                key={file.path}
                className="flex items-center gap-3 px-4 py-3 active:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/workspace/${projectId}/code?file=${encodeURIComponent(file.path)}`)}
              >
                <FileIcon className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{file.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{file.size} · {file.modified}</div>
                </div>
              </div>
            ))}
            {data?.folders.length === 0 && data?.files.length === 0 && (
              <div className="text-center py-10 text-gray-400">空目录</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
