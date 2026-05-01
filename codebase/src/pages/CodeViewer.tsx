import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, MoreVertical, Edit3, List, Search, Settings2 } from 'lucide-react';

export default function CodeViewer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileName = searchParams.get('file') || 'Button.tsx';

  const mockCode = `import React from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          "disabled:opacity-50 disabled:pointer-events-none",
          {
            'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
            'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
            'border border-gray-200 bg-transparent hover:bg-gray-100': variant === 'outline',
            'h-8 px-3 text-xs': size === 'sm',
            'h-10 px-4 py-2 text-sm': size === 'md',
            'h-12 px-8 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
`;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-base font-medium text-gray-900 truncate max-w-[200px]">{fileName}</h2>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Edit3 className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Code Area */}
      <div className="flex-1 overflow-auto bg-[#fafafa]">
        <div className="flex min-w-max">
          {/* Line Numbers */}
          <div className="w-12 shrink-0 bg-gray-50 border-r border-gray-200 py-4 text-right pr-3 select-none">
            {mockCode.split('\n').map((_, i) => (
              <div key={i} className="text-xs text-gray-400 font-mono leading-6 h-6">{i + 1}</div>
            ))}
          </div>
          {/* Code Content */}
          <div className="flex-1 py-4 px-4">
            <pre className="text-sm font-mono leading-6 text-gray-800 m-0">
              <code>
                {mockCode.split('\n').map((line, i) => (
                  <div key={i} className="h-6 whitespace-pre">{line || ' '}</div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-around shrink-0 pb-safe">
        <button className="p-2 flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600">
          <List className="w-5 h-5" />
          <span className="text-[10px]">大纲</span>
        </button>
        <button className="p-2 flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600">
          <Search className="w-5 h-5" />
          <span className="text-[10px]">搜索</span>
        </button>
        <button className="p-2 flex flex-col items-center gap-1 text-gray-500 hover:text-blue-600">
          <Settings2 className="w-5 h-5" />
          <span className="text-[10px]">显示</span>
        </button>
      </div>
    </div>
  );
}