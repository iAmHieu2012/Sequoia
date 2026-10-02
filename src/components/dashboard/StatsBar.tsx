"use client";

import React from 'react';
import { ClipboardCheck, ClipboardX, Activity } from "lucide-react";
import CyberFlipCard from "@/components/ui/CyberFlipCard";
import CyberPanel from "@/components/ui/CyberPanel";
import { CyberProgressBar } from "@/components/ui/CyberProgressBar";
import { type User } from "@supabase/supabase-js";
import { UserProgress } from "@/hooks/cosmos/useCosmosData";

interface CategoryProgress {
  total: number;
  completed: number;
}

interface ProgressSummary {
  textbooks: Record<string, CategoryProgress>;
  topics: Record<string, CategoryProgress>;
  standalone: Record<string, boolean>;
}

interface StatsBarProps {
  /** The authenticated user object */
  user: User | null;
  /** Summary of progress across textbooks, topics, and standalone nodes */
  progressSummary: ProgressSummary | null;
  /** Total count of rogue (standalone) anomalies/articles */
  rogueArticlesLength: number;
  /** Total count of active textbooks/codexes */
  textbooksLength: number;
  /** Detailed user progress including current streak */
  userProgress: UserProgress | null;
}

/**
 * Renders the top statistics bar displaying user progress, decoded signals,
 * anomalies detected, active codexes, and learning streaks.
 */
export default function StatsBar({
  user,
  progressSummary,
  userProgress
}: StatsBarProps) {
  let sigDecoded = 0;
  let undiscovered = 0;
  let totalNodes = 0;

  if (progressSummary) {
    Object.values(progressSummary.topics).forEach(p => {
      sigDecoded += p.completed;
      totalNodes += p.total;
    });
    Object.values(progressSummary.standalone).forEach(isCompleted => {
      if (isCompleted) sigDecoded++;
      totalNodes++;
    });
    undiscovered = totalNodes - sigDecoded;
  }

  const sysProgress = totalNodes > 0 ? (sigDecoded / totalNodes) : 0;
  const sysProgressPercent = Math.round(sysProgress * 100);
  const displayProgress = user ? sysProgressPercent : 0;
  
  // Calculate width ratio for the split (min 35%, max 65%)
  const leftRatio = Math.max(35, Math.min(65, displayProgress));
  const rightRatio = 100 - leftRatio;

  const leftColorClass = "text-teal drop-shadow-[0_0_15px_var(--color-teal)]";
  const rightColorClass = "text-coral drop-shadow-[0_0_15px_var(--color-coral)]";

  // Mobile tap states
  const [isProgressFlipped, setIsProgressFlipped] = React.useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      
      {/* Stat 1: PROGRESS (Tactical Wireframe Hover Split) */}
      <div 
        className="relative h-20 md:h-24 border border-white/20 bg-space-bg group overflow-hidden clip-chamfer-tr-bl cursor-pointer md:cursor-default transition-colors duration-500"
        onClick={() => setIsProgressFlipped(!isProgressFlipped)}
      >

        {/* DEFAULT STATE (Solid White Shell) */}
        <div className={`absolute inset-0 transition-all duration-500 z-20 ${isProgressFlipped ? '-translate-y-full opacity-0' : 'md:group-hover:-translate-y-full md:group-hover:opacity-0'}`}>
          <CyberPanel
            variant="solid-white"
            chamfer="none"
            stripes="right"
            decorations="minimal"
            padded={false}
            stripeClassName="w-[30%] min-w-[100px]"
            className="w-full h-full flex"
          >
            {/* Left Side: Label & Bar */}
            <div className="flex flex-col justify-center w-[70%] max-w-[calc(100%-100px)] h-full pl-6 md:pl-8 pr-4 md:pr-6 relative z-10">
              <CyberProgressBar 
                progress={displayProgress} 
                label="PROGRESS" 
                showRuler={true} 
                theme="light"
              />
            </div>
            
            {/* Right Side: Massive Glow Number */}
            <div className="relative z-10 flex items-center justify-end w-[30%] min-w-[100px] h-full pr-6 md:pr-8">
              <span className="text-4xl md:text-5xl font-mono font-black text-space-bg transition-all duration-300 leading-none">
                {displayProgress}
              </span>
              <span className="text-lg font-mono text-space-bg/60 ml-1 mb-4">%</span>
              <div className="absolute -right-2 -top-2 w-12 h-12 text-space-bg opacity-10 transition-opacity [&>svg]:w-full [&>svg]:h-full">
                <Activity />
              </div>
            </div>
          </CyberPanel>
        </div>

        {/* HOVER STATE: Split */}
        <div className={`absolute inset-0 flex transition-all duration-500 ease-out z-10 ${isProgressFlipped ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100'}`}>
          
          {/* LEFT HALF */}
          <div 
            className="h-full bg-space-bg flex flex-col justify-center px-4 md:px-6 relative overflow-hidden group/left transition-all duration-500 border-r border-white/10"
            style={{ width: `${leftRatio}%` }}
          >
            {/* Colored Decor */}
            <div className={`absolute top-2 left-2 w-2 h-2 border-t border-l border-current opacity-40 ${leftColorClass}`}></div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover/left:opacity-100 transition-opacity pointer-events-none"></div>
            <span className={`text-xs font-mono tracking-[0.2em] uppercase mb-1 relative z-10 ${leftColorClass}`}>
              DECODED
            </span>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className={`text-2xl md:text-3xl font-mono font-black leading-none ${leftColorClass}`}>
                {user ? sigDecoded : '---'}
              </span>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-16 h-16 opacity-5 group-hover/left:opacity-20 transition-opacity [&>svg]:w-full [&>svg]:h-full ${leftColorClass}`}>
              <ClipboardCheck />
            </div>
          </div>

          {/* RIGHT HALF */}
          <div 
            className="h-full bg-space-bg flex flex-col justify-center px-4 md:px-6 relative overflow-hidden group/right transition-all duration-500 text-right items-end"
            style={{ width: `${rightRatio}%` }}
          >
            {/* Colored Decor */}
            <div className={`absolute bottom-2 right-2 w-2 h-2 border-b border-r border-current opacity-40 ${rightColorClass}`}></div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover/right:opacity-100 transition-opacity pointer-events-none"></div>
            <span className={`text-xs font-mono tracking-[0.2em] uppercase mb-1 relative z-10 ${rightColorClass}`}>
              UNKNOWN
            </span>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className={`text-2xl md:text-3xl font-mono font-black leading-none ${rightColorClass}`}>
                {user ? undiscovered : '---'}
              </span>
            </div>
            <div className={`absolute -left-4 -bottom-4 w-16 h-16 opacity-5 group-hover/right:opacity-20 transition-opacity [&>svg]:w-full [&>svg]:h-full ${rightColorClass}`}>
              <ClipboardX />
            </div>
          </div>
          
        </div>
      </div>

      {/* Stat 2: CURRENT_STREAK (Mechanical Inverted Reveal) */}
      <CyberFlipCard
        frontTitle="CURRENT STREAK"
        frontValue={user ? (userProgress?.current_streak || 0) : '---'}
        frontUnit="DAYS"
        backTitle="PEAK STREAK"
        backValue={user ? (userProgress?.longest_streak || userProgress?.current_streak || 0) : '---'}
        backUnit="DAYS"
      />

    </div>
  );
}
