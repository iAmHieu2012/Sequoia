import React from 'react';

interface CyberProgressBarProps {
  progress: number;
  label: string;
  className?: string;
  showRuler?: boolean;
  theme?: 'dark' | 'light';
}

export function CyberProgressBar({ 
  progress, 
  label, 
  className = '', 
  showRuler = true,
  theme = 'dark'
}: CyberProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const isLight = theme === 'light';
  
  const textClass = isLight ? 'text-space-bg' : 'text-white';
  const blockClass = isLight ? 'bg-space-bg' : 'bg-white';
  const borderClass = isLight ? 'border-space-bg/40' : 'border-white/40';
  const bgClass = isLight ? 'bg-space-bg/5' : 'bg-black/20';
  const fillClass = isLight ? 'bg-space-bg' : 'bg-white';
  const rulerClass = isLight ? 'ruler-bottom invert' : 'ruler-bottom'; // Using invert for quick black ruler

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-end mb-1">
        <span className={`text-xs font-mono tracking-widest uppercase ${textClass}`}>
          {label}
        </span>
        <div className="flex gap-[2px] mb-0.5">
          <div className={`w-1 h-1.5 md:h-2 ${blockClass}`}></div>
          <div className={`w-1 h-1.5 md:h-2 ${blockClass} opacity-50`}></div>
          <div className={`w-1 h-1.5 md:h-2 ${blockClass} opacity-20`}></div>
        </div>
      </div>
      <div className={`h-3 md:h-4 w-full border ${borderClass} p-[2px] relative overflow-hidden ${bgClass}`}>
        <div 
          className={`h-full transition-all duration-1000 ease-out ${fillClass}`}
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
      {showRuler && <div className={`h-2 w-full mt-1 opacity-50 ${rulerClass}`}></div>}
    </div>
  );
}
