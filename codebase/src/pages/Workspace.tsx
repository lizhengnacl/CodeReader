import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Folder, Search, GitBranch, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import FilesTab from './tabs/FilesTab';
import SearchTab from './tabs/SearchTab';
import GitTab from './tabs/GitTab';
import SettingsTab from './tabs/SettingsTab';

export default function Workspace() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = searchParams.get('tab') || 'files';
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then(res => res.json())
      .then(setProject)
      .catch(() => {});
  }, [projectId]);

  const tabs = [
    { id: 'files', label: '文件', icon: Folder },
    { id: 'search', label: '搜索', icon: Search },
    { id: 'git', label: 'Git', icon: GitBranch },
    { id: 'settings', label: '设置', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 flex flex-col">
      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === 'files' && <FilesTab projectId={projectId || ''} project={project} />}
        {tab === 'search' && <SearchTab projectId={projectId || ''} />}
        {tab === 'git' && <GitTab projectId={projectId || ''} />}
        {tab === 'settings' && <SettingsTab />}
      </div>

      <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe">
        <div className="flex items-center justify-around h-14">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => navigate(`/workspace/${projectId}?tab=${t.id}`)}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "fill-blue-50 dark:fill-blue-900/30")} />
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
