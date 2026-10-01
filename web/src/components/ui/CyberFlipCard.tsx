import React from 'react';

interface CyberFlipCardProps {
  frontTitle: string;
  frontValue: React.ReactNode;
  frontUnit?: string;
  
  backTitle: string;
  backValue: React.ReactNode;
  backUnit?: string;
  
  className?: string;
}

import CyberPanel from './CyberPanel';

export default function CyberFlipCard({
  frontTitle,
  frontValue,
  frontUnit,
  backTitle,
  backValue,
  backUnit,
  className = ''
}: CyberFlipCardProps) {
  return (
    <div className={`relative h-20 md:h-24 group overflow-hidden clip-chamfer-tl-br cursor-default border border-white/20 bg-space-bg ${className}`}>
      
      {/* FRONT STATE (Cyberpunk Dark) */}
      <div className="absolute inset-0 transition-transform duration-500 group-hover:translate-y-full z-10">
        <CyberPanel 
          variant="solid-dark" 
          chamfer="none" 
          stripes="right"
          padded={false}
          stripeClassName="w-[30%] min-w-[100px]"
          className="w-full h-full flex flex-col justify-between p-4 md:px-6 border-none"
        >
          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest text-white/70">
              {frontTitle}
            </span>
            <div className="w-6 h-[2px] bg-white/40"></div>
          </div>
          
          <div className="flex justify-between items-end relative z-10">
            <div className="flex gap-1 mb-1">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/40"></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/40"></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/40"></div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl md:text-5xl font-mono font-black leading-none tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                {frontValue}
              </span>
              {frontUnit && (
                <div className="text-xs font-mono uppercase tracking-widest mb-1 text-white/40">
                  {frontUnit}
                </div>
              )}
            </div>
          </div>
        </CyberPanel>
      </div>

      {/* BACK STATE (Brutalist White Invert) */}
      <div className="absolute inset-0 -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
        <CyberPanel 
          variant="solid-white"
          chamfer="none"
          stripes="right"
          padded={false}
          stripeClassName="w-[30%] min-w-[100px]"
          className="w-full h-full flex flex-col justify-between p-4 md:px-6 border-none"
        >
          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest">
              {backTitle}
            </span>
            <div className="w-6 h-[2px] bg-space-bg"></div>
          </div>
          
          <div className="flex justify-between items-end relative z-10">
            <div className="flex gap-1 mb-1">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-space-bg"></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-space-bg"></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-space-bg"></div>
            </div>
            <div className="flex items-baseline gap-1.5 text-space-bg">
              <span className="text-4xl md:text-5xl font-mono font-black leading-none tracking-tight">
                {backValue}
              </span>
              {backUnit && (
                <div className="text-xs font-mono uppercase tracking-widest mb-1">
                  {backUnit}
                </div>
              )}
            </div>
          </div>
        </CyberPanel>
      </div>
    </div>
  );
}
