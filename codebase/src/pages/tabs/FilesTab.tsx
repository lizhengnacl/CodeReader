import React, { useState, useEffect } from 'react';
import { ChevronLeft, MoreVertical, ChevronRight, Folder as FolderIcon, Search, Star, RefreshCw, Info, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FileIconByType from '../../components/FileIconByType';

function getFavorites(projectId: string): string[] {
  try {
    const raw = localStorage.getItem(`codereader-favorites-${projectId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function setFavorites(projectId: string, paths: string[]) {
  localStorage.setItem(`codereader-favorites-${projectId}`, JSON.stringify(paths));
}

export default function FilesTab({ projectId, project }: { projectId: string; project: any }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dirPath = searchParams.get('path') || '';
  const [data, setData] = useState<{ folders: any[]; files: any[]; breadcrumbs: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [favorites, setFavs] = useState<string[]>([]);
  const [showFavs, setShowFavs] = useState(false);

  useEffect(() => {
    setFavs(getFavorites(projectId));
  }, [projectId]);

  const isFav = favorites.includes(dirPath);

  const toggleFav = () => {
    const next = isFav
      ? favorites.filter(p => p !== dirPath)
      : [...favorites, dirPath];
    setFavs(next);
    setFavorites(projectId, next);
  };

  const loadData = () => {
    setLoading(true);
    fetch(`/api/projects/${projectId}/files?path=${encodeURIComponent(dirPath)}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
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
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">{projectName}</h2>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
              <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">{branch}</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(m => !m)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 min-w-[160px] py-1 overflow-hidden">
                <button
                  onClick={() => { loadData(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <RefreshCw className="w-4 h-4" /> 刷新
                </button>
                <button
                  onClick={() => { setShowFavs(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Star className="w-4 h-4" /> 收藏列表
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => { setShowMenu(false); }}
                >
                  <Info className="w-4 h-4" /> 项目信息
                </button>
              </div>
            </>
          )}
        </div>
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
        <button
          onClick={toggleFav}
          className={`p-2 transition-colors ${isFav ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500 hover:text-yellow-500'}`}
        >
          <Star className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} />
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
                <FileIconByType fileName={file.name} className="w-5 h-5 shrink-0" />
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

      {showFavs && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowFavs(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-lg p-5 animate-slide-up max-h-[60vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">收藏列表</h3>
              <button onClick={() => setShowFavs(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {favorites.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                  暂无收藏<br />
                  <span className="text-xs">点击星标按钮收藏当前目录</span>
                </div>
              ) : (
                <div className="space-y-1">
                  {favorites.map(favPath => {
                    const name = favPath.split('/').pop() || favPath || '(根目录)';
                    return (
                      <div
                        key={favPath}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer active:scale-[0.98] transition-all"
                        onClick={() => {
                          setShowFavs(false);
                          navigate(`/workspace/${projectId}?tab=files&path=${encodeURIComponent(favPath)}`);
                        }}
                      >
                        <FolderIcon className="w-4 h-4 text-yellow-500 fill-yellow-100 dark:fill-yellow-900/30 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 dark:text-gray-100 truncate">{name}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{favPath || '/'}</div>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            const next = favorites.filter(p => p !== favPath);
                            setFavs(next);
                            setFavorites(projectId, next);
                          }}
                          className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
