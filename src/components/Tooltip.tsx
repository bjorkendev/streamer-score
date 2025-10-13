import { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 w-64 px-3 py-2 text-sm text-white bg-slate-950 rounded-lg shadow-lg -top-2 left-full ml-2 border border-violet-600/30">
          <div className="relative">
            {content}
            <div className="absolute w-2 h-2 bg-slate-950 border-l border-b border-violet-600/30 transform rotate-45 -left-4 top-2"></div>
          </div>
        </div>
      )}
    </div>
  );
}

