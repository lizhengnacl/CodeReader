import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Settings, Plus, FolderGit2, ChevronRight } from 'lucide-react';

export default function ProjectList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FolderGit2 className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">CodeReader</h1>
        </div>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Search */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索项目..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
        </div>
      </div>

      {/* Project List */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-400">加载中...</div>
        ) : (
          filteredProjects.map(project => (
            <div
              key={project.id}
              onClick={() => navigate(`/workspace/${project.id}?tab=files`)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer relative"
            >
              {project.hasChanges && (
                <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-orange-500 rounded-full" />
              )}
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
              <p className="text-sm text-gray-500 mb-3 truncate">{project.path}</p>
              
              {/* Language Bar */}
              {project.languages && project.languages.length > 0 && (
                <div className="h-1.5 w-full rounded-full overflow-hidden flex mb-3">
                  {project.languages.map(lang => (
                    <div key={lang.name} style={{ width: `${lang.percent}%`, backgroundColor: lang.color }} />
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-gray-100 rounded-md font-mono">{project.branch}</span>
                  <span>{project.files} 个文件</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))
        )}
        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            未找到匹配的项目
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="fixed right-6 bottom-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
