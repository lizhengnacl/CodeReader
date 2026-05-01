import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Folder, Home, Monitor,
  FileText, Download, Code2, Check,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  home: <Home className="w-4 h-4" />,
  desktop: <Monitor className="w-4 h-4" />,
  doc: <FileText className="w-4 h-4" />,
  download: <Download className="w-4 h-4" />,
  code: <Code2 className="w-4 h-4" />,
};

interface DirBrowserProps {
  onSelect: (path: string) => void;
  selectedPath: string;
}

export default function DirBrowser({ onSelect, selectedPath }: DirBrowserProps) {
  const [currentPath, setCurrentPath] = useState('');
  const [dirs, setDirs] = useState<any[]>([]);
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [commonPaths, setCommonPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDir = (dirPath: string) => {
    setLoading(true);
    fetch(`/api/browse?path=${encodeURIComponent(dirPath)}`)
      .then(res => res.json())
      .then(data => {
        setCurrentPath(data.currentPath);
        setDirs(data.dirs);
        setParentPath(data.parentPath);
        setCommonPaths(data.commonPaths || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadDir('');
  }, []);

  const handleDirClick = (dirPath: string) => {
    loadDir(dirPath);
  };

  const handleSelectThis = () => {
    onSelect(currentPath);
  };

  const handleSelectSub = (dirPath: string) => {
    onSelect(dirPath);
  };

  return (
    <div className="flex flex-col h-72 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      {/* Current path bar */}
      <div className="bg-white px-3 py-2 border-b border-gray-200 flex items-center gap-2 shrink-0">
        <Folder className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="text-xs font-mono text-gray-600 truncate flex-1">{currentPath || '...'}</span>
        <button
          onClick={handleSelectThis}
          className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            selectedPath === currentPath
              ? 'bg-blue-600 text-white'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          选择此目录
        </button>
      </div>

      {/* Quick access */}
      {commonPaths.length > 0 && (
        <div className="bg-white px-3 py-2 border-b border-gray-200 shrink-0">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {commonPaths.map(p => (
              <button
                key={p.path}
                onClick={() => loadDir(p.path)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600 shrink-0 transition-colors"
              >
                {ICON_MAP[p.icon] || <Folder className="w-4 h-4" />}
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Directory list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">加载中...</div>
        ) : (
          <div>
            {/* Parent dir */}
            {parentPath && (
              <button
                onClick={() => loadDir(parentPath)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-400 shrink-0" />
                <Folder className="w-5 h-5 text-gray-300 shrink-0" />
                <span className="text-sm text-gray-400">..</span>
              </button>
            )}
            {/* Sub dirs */}
            {dirs.map(dir => (
              <div
                key={dir.path}
                className="flex items-center border-b border-gray-50"
              >
                <button
                  onClick={() => handleDirClick(dir.path)}
                  className="flex-1 flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <Folder className="w-5 h-5 text-blue-400 fill-blue-100 shrink-0" />
                  <span className="text-sm text-gray-800 truncate">{dir.name}</span>
                </button>
                <button
                  onClick={() => handleSelectSub(dir.path)}
                  className={`shrink-0 px-2 py-1 mr-3 rounded-md text-xs transition-colors ${
                    selectedPath === dir.path
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-500 hover:bg-blue-50'
                  }`}
                >
                  {selectedPath === dir.path ? <Check className="w-3.5 h-3.5" /> : '选择'}
                </button>
              </div>
            ))}
            {dirs.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-400 text-sm">此目录没有子目录</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
