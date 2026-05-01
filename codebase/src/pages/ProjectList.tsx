import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Settings, Plus, FolderGit2, ChevronRight, X } from 'lucide-react';
import DirBrowser from '../components/DirBrowser';
import { useTheme } from '../lib/ThemeContext';

export default function ProjectList() {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPath, setFormPath] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nameManuallyEdited = useRef(false);

  const loadProjects = () => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handlePathSelect = (selectedPath: string) => {
    setFormPath(selectedPath);
    if (!nameManuallyEdited.current) {
      const dirName = selectedPath.split('/').filter(Boolean).pop() || '';
      setFormName(dirName);
    }
  };

  const handleNameChange = (value: string) => {
    setFormName(value);
    nameManuallyEdited.current = true;
  };

  const handleOpenModal = () => {
    nameManuallyEdited.current = false;
    setFormName('');
    setFormPath('');
    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    nameManuallyEdited.current = false;
  };

  const handleAdd = () => {
    if (!formName.trim() || !formPath.trim()) {
      setFormError('名称和路径不能为空');
      return;
    }
    setSubmitting(true);
    setFormError('');
    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formName.trim(), path: formPath.trim() }),
    })
      .then(res => res.json())
      .then(data => {
        setSubmitting(false);
        if (data.error) {
          setFormError(data.error);
        } else {
          handleCloseModal();
          loadProjects();
        }
      })
      .catch(() => {
        setSubmitting(false);
        setFormError('添加失败');
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FolderGit2 className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">CodeReader</h1>
        </div>
        <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="搜索项目..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-transparent rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {loading ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">加载中...</div>
        ) : (
          filteredProjects.map(project => (
            <div
              key={project.id}
              onClick={() => navigate(`/workspace/${project.id}?tab=files`)}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform cursor-pointer relative"
            >
              {project.hasChanges && (
                <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-orange-500 rounded-full" />
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{project.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">{project.path}</p>

              {project.languages && project.languages.length > 0 && (
                <div className="h-1.5 w-full rounded-full overflow-hidden flex mb-3">
                  {project.languages.map(lang => (
                    <div key={lang.name} style={{ width: `${lang.percent}%`, backgroundColor: lang.color }} />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md font-mono">{project.branch}</span>
                  <span>{project.files} 个文件</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          ))
        )}
        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            未找到匹配的项目
          </div>
        )}
      </div>

      <button
        onClick={handleOpenModal}
        className="fixed right-6 bottom-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all z-20"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 dark:bg-black/60" onClick={handleCloseModal}>
          <div
            className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-2xl p-6 pb-safe animate-slide-up max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">添加项目</h2>
              <button onClick={handleCloseModal} className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1">
              <DirBrowser onSelect={handlePathSelect} selectedPath={formPath} />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">项目名称</label>
                <input
                  type="text"
                  placeholder="选择目录后自动填充"
                  value={formName}
                  onChange={e => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              {formPath && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <FolderGit2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-xs font-mono text-blue-700 dark:text-blue-300 truncate">{formPath}</span>
                </div>
              )}

              {formError && (
                <p className="text-sm text-red-500">{formError}</p>
              )}
            </div>

            <div className="pt-4 shrink-0">
              <button
                onClick={handleAdd}
                disabled={submitting || !formPath}
                className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-medium hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '添加中...' : '添加项目'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
