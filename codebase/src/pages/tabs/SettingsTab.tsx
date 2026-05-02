import React, { useState, useEffect } from 'react';
import { Moon, Type, Eye, Info, ChevronRight, Minus, Plus, Check, X, Sparkles } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';
import { useSettings } from '../../lib/SettingsContext';

const FONT_SIZES = [10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24];
const DIFF_VIEWS = [
  { value: 'unified' as const, label: 'Unified', desc: '合并视图，新旧代码交替显示' },
  { value: 'split' as const, label: 'Split', desc: '分栏视图，左右对比显示' },
];

export default function SettingsTab() {
  const { theme, toggleTheme } = useTheme();
  const { fontSize, setFontSize, diffView, setDiffView } = useSettings();
  const isDark = theme === 'dark';
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showDiffPicker, setShowDiffPicker] = useState(false);
  const [showAiConfig, setShowAiConfig] = useState(false);
  const [aiConfig, setAiConfig] = useState({ apiKey: '', baseUrl: '', model: '', configured: false });

  useEffect(() => {
    fetch('/api/ai/config')
      .then(res => res.json())
      .then(setAiConfig)
      .catch(() => {});
  }, []);

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

            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700" onClick={() => setShowFontPicker(true)}>
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-gray-100">字体大小</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{fontSize}px</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 active:bg-gray-50 dark:active:bg-gray-700" onClick={() => setShowDiffPicker(true)}>
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-900 dark:text-gray-100">默认 Diff 视图</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{DIFF_VIEWS.find(v => v.value === diffView)?.label}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">AI 设置</h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between p-4 active:bg-gray-50 dark:active:bg-gray-700" onClick={() => setShowAiConfig(true)}>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <span className="text-sm text-gray-900 dark:text-gray-100">AI Commit</span>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {aiConfig.configured
                      ? `已配置 · ${aiConfig.model}`
                      : '未配置'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
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

      {showFontPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowFontPicker(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-lg p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">字体大小</h3>
              <button onClick={() => setShowFontPicker(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 mb-5">
              <button
                onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                disabled={fontSize <= 10}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-30 active:scale-95 transition-all"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="text-center min-w-[80px]">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{fontSize}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">px</div>
              </div>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                disabled={fontSize >= 24}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-30 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <pre className="font-mono text-gray-700 dark:text-gray-300 overflow-x-auto" style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}>
{`function hello() {
  console.log("Hello!");
  return 42;
}`}
              </pre>
            </div>

            <div className="flex flex-wrap gap-2">
              {FONT_SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    fontSize === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 active:scale-95'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showDiffPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowDiffPicker(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-lg p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">默认 Diff 视图</h3>
              <button onClick={() => setShowDiffPicker(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {DIFF_VIEWS.map(v => (
                <button
                  key={v.value}
                  onClick={() => { setDiffView(v.value); setShowDiffPicker(false); }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    diffView === v.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 active:scale-[0.98]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${diffView === v.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>{v.label}</span>
                    {diffView === v.value && <Check className="w-5 h-5 text-blue-500" />}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">{v.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAiConfig && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowAiConfig(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-lg p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">AI Commit 配置</h3>
              <button onClick={() => setShowAiConfig(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">状态</span>
                  <span className={`text-sm font-medium ${aiConfig.configured ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {aiConfig.configured ? '已配置' : '未配置'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">API Key</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">{aiConfig.apiKey || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Base URL</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-mono truncate max-w-[200px]">{aiConfig.baseUrl}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">模型</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-mono">{aiConfig.model}</span>
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  请在项目根目录 <code className="bg-purple-100 dark:bg-purple-800/50 px-1.5 py-0.5 rounded text-xs font-mono">.env</code> 文件中配置以下变量：
                </p>
                <pre className="mt-3 text-xs font-mono text-purple-800 dark:text-purple-200 bg-purple-100/50 dark:bg-purple-900/30 p-3 rounded-lg overflow-x-auto">
{`AI_API_KEY=sk-xxxxx
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini`}
                </pre>
                <p className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                  支持 OpenAI、DeepSeek 等 OpenAI 兼容 API
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
