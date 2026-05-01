import React from 'react';
import { Settings, Moon, Type, Eye, Info, ChevronRight } from 'lucide-react';

export default function SettingsTab() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white px-4 py-3 border-b border-gray-200 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">设置</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Section 1 */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">显示设置</h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-900">深色模式</span>
              </div>
              <div className="w-11 h-6 bg-gray-200 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50">
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-900">字体大小</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>14px</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 active:bg-gray-50">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-900">默认 Diff 视图</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Unified</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">关于</h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-900">版本信息</span>
              </div>
              <span className="text-sm text-gray-500">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between p-4 active:bg-gray-50">
              <span className="text-sm text-gray-900 ml-8">帮助与反馈</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </section>

        <div className="pt-4">
          <button className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-medium active:bg-red-50 transition-colors">
            移除当前项目
          </button>
        </div>

      </div>
    </div>
  );
}