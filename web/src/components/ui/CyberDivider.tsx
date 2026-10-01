import React from 'react';

interface CyberDividerProps {
  variant?: 'barcode' | 'ruler' | 'dots' | 'solid';
  className?: string;
}

export default function CyberDivider({ variant = 'solid', className = '' }: CyberDividerProps) {
  if (variant === 'barcode') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-2 h-2 bg-white"></div>
        <div className="w-1 h-2 bg-white"></div>
        <div className="w-4 h-2 bg-white"></div>
        <div className="flex-1 h-[2px] bg-white"></div>
        <div className="w-8 h-[2px] bg-white/40"></div>
      </div>
    );
  }

  if (variant === 'ruler') {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex-1 h-[2px] bg-white w-full"></div>
        <div className="h-2 w-[40%] ruler-bottom"></div>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center gap-1 opacity-40 ${className}`}>
        <div className="w-1 h-1 bg-white"></div><div className="w-1 h-1 bg-white"></div>
        <div className="w-4 h-[1px] bg-white"></div>
        <div className="w-1 h-1 bg-white"></div><div className="w-1 h-1 bg-white"></div>
        <div className="flex-1 h-[1px] bg-white"></div>
      </div>
    );
  }

  // solid line
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-2 h-2 border border-white"></div>
      <div className="w-8 h-[2px] bg-white"></div>
      <div className="flex-1 h-[1px] bg-white/40"></div>
    </div>
  );
}
