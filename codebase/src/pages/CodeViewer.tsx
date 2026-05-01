import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, MoreVertical, Edit3, List, Search, Settings2 } from 'lucide-react';

export default function CodeViewer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileName = searchParams.get('file') || '';
  const displayFileName = fileName.split('/').pop() || 'Unknown';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const projectId = window.location.pathname.split('/')[2];

  useEffect(() => {
    if (!fileName) return;
    setLoading(true);
    fetch(`/api/projects/${projectId}/code?file=${encodeURIComponent(fileName)}`)
      .then(res => {
        if (!res.ok) throw new Error('文件读取失败');
        return res.json();
      })
      .then(data => {
        setCode(data.content || '');
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [fileName, projectId]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 flex flex-col">
      <header className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{displayFileName}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <Edit3 className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto bg-[#fafafa] dark:bg-gray-900">
        {loading ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">加载中...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-400">{error}</div>
        ) : (
          <div className="flex min-w-max">
            <div className="w-12 shrink-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 py-4 text-right pr-3 select-none">
              {code.split('\n').map((_, i) => (
                <div key={i} className="text-xs text-gray-400 dark:text-gray-600 font-mono leading-6 h-6">{i + 1}</div>
              ))}
            </div>
            <div className="flex-1 py-4 px-4">
              <pre className="text-sm font-mono leading-6 text-gray-800 dark:text-gray-200 m-0">
                <code>
                  {code.split('\n').map((line, i) => (
                    <div key={i} className="h-6 whitespace-pre">{line || ' '}</div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-around shrink-0 pb-safe">
        <button className="p-2 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-600">
          <List className="w-5 h-5" />
          <span className="text-[10px]">大纲</span>
        </button>
        <button className="p-2 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-600">
          <Search className="w-5 h-5" />
          <span className="text-[10px]">搜索</span>
        </button>
        <button className="p-2 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-600">
          <Settings2 className="w-5 h-5" />
          <span className="text-[10px]">显示</span>
        </button>
      </div>
    </div>
  );
}
