import React from 'react';
import { Settings, Moon, Type, Eye, Info, ChevronRight } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';

export default function SettingsTab() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">设置</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        <section>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">显示设置</h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700" onClick={toggleTheme}>
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-gray-100">深色模式</span>
              </div>
              <div className={`w-11 h-6 rounded-full relative transition-colors ${isDark ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isDark ? 'translate-x-5' : 'translate-x-1'}`}></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700">
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-gray-100">字体大小</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>14px</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 active:bg-gray-50 dark:active:bg-gray-700">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-gray-100">默认 Diff 视图</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Unified</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">关于</h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-gray-100">版本信息</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between p-4 active:bg-gray-50 dark:active:bg-gray-700">
              <span className="text-sm text-gray-900 dark:text-gray-100 ml-8">帮助与反馈</span>
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </section>

        <div className="pt-4">
          <button className="w-full py-3 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium active:bg-red-50 dark:active:bg-red-900/30 transition-colors">
            移除当前项目
          </button>
        </div>

      </div>
    </div>
  );
}
