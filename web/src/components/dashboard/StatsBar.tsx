"use client";

import { ShieldCheck, ClipboardClock, Radar, BookText, Activity } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";
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
  user: User | null;
  progressSummary: ProgressSummary | null;
  rogueArticlesLength: number;
  textbooksLength: number;
  userProgress: UserProgress | null;
}

export default function StatsBar({
  user,
  progressSummary,
  rogueArticlesLength,
  textbooksLength,
  userProgress
}: StatsBarProps) {
  let sigDecoded = 0;
  let undiscovered = 0;
  const anomalies = rogueArticlesLength;
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

  return (
    <div className="grid grid-cols-5 gap-3">
        {/* Stat 1: SIG_DECODED */}
        <div className="bg-black/60 border border-panel-border hover:border-blue/50 p-3 relative group hover:bg-blue/5 transition-all duration-300 flex items-center gap-4 overflow-hidden cursor-default">
          <CyberBrackets color="border-blue/30 group-hover:border-blue transition-colors duration-300" />
          <div className="absolute left-0 top-0 w-1 h-full bg-blue scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-blue)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-blue/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <div className="w-10 h-10 bg-blue/5 border border-blue/20 group-hover:border-blue/50 group-hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-blue)_30%,transparent)] flex items-center justify-center text-blue shrink-0 relative transition-all duration-300">
            <ShieldCheck className="w-5 h-5 relative z-10 opacity-60 group-hover:opacity-100 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300" />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="block text-[9px] font-mono text-text-dim group-hover:text-blue/80 tracking-widest mb-1 uppercase transition-colors duration-300">DECODED</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-heading font-bold text-white group-hover:drop-shadow-[0_0_8px_var(--color-blue)] group-hover:text-blue transition-all duration-300">{user ? sigDecoded : '---'}</span>
              <span className="text-[10px] font-mono text-blue/60 group-hover:text-blue transition-colors duration-300">SIGNALS</span>
            </div>
          </div>
        </div>

        {/* Stat 2: ACTIVE_DECODE */}
        <div className="bg-black/60 border border-panel-border hover:border-green/50 p-3 relative group hover:bg-green/5 transition-all duration-300 flex items-center gap-4 overflow-hidden cursor-default">
          <CyberBrackets color="border-green/30 group-hover:border-green transition-colors duration-300" />
          <div className="absolute left-0 top-0 w-1 h-full bg-green scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-green)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-green/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <div className="w-10 h-10 bg-green/5 border border-green/20 group-hover:border-green/50 group-hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-green)_30%,transparent)] flex items-center justify-center text-green shrink-0 relative transition-all duration-300">
            <ClipboardClock className="w-5 h-5 relative z-10 opacity-60 group-hover:opacity-100 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300" />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="block text-[9px] font-mono text-text-dim group-hover:text-green/80 tracking-widest mb-1 uppercase transition-colors duration-300">UNKNOWN</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-heading font-bold text-white group-hover:drop-shadow-[0_0_8px_var(--color-green)] group-hover:text-green transition-all duration-300">{user ? undiscovered : '---'}</span>
              <span className="text-[10px] font-mono text-green/60 group-hover:text-green transition-colors duration-300">WAITING</span>
            </div>
          </div>
        </div>

        {/* Stat 3: ANOMALIES */}
        <div className="bg-black/60 border border-panel-border hover:border-pink/50 p-3 relative group hover:bg-pink/5 transition-all duration-300 flex items-center gap-4 overflow-hidden cursor-default">
          <CyberBrackets color="border-pink/30 group-hover:border-pink transition-colors duration-300" />
          <div className="absolute left-0 top-0 w-1 h-full bg-pink scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-pink)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-pink/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <div className="w-10 h-10 bg-pink/5 border border-pink/20 group-hover:border-pink/50 group-hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-pink)_30%,transparent)] flex items-center justify-center text-pink shrink-0 relative transition-all duration-300">
            <Radar className="w-5 h-5 relative z-10 opacity-60 group-hover:opacity-100 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300" />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="block text-[9px] font-mono text-text-dim group-hover:text-pink/80 tracking-widest mb-1 uppercase transition-colors duration-300">ANOMALIES</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-heading font-bold text-white group-hover:drop-shadow-[0_0_8px_var(--color-pink)] group-hover:text-pink transition-all duration-300">{user ? anomalies : '---'}</span>
              <span className="text-[10px] font-mono text-pink/60 group-hover:text-pink transition-colors duration-300">DETECTED</span>
            </div>
          </div>
        </div>

        {/* Stat 4: TEXTBOOKS */}
        <div className="bg-black/60 border border-panel-border hover:border-yellow/50 p-3 relative group hover:bg-yellow/5 transition-all duration-300 flex items-center gap-4 overflow-hidden cursor-default">
          <CyberBrackets color="border-yellow/30 group-hover:border-yellow transition-colors duration-300" />
          <div className="absolute left-0 top-0 w-1 h-full bg-yellow scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-yellow)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-yellow/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <div className="w-10 h-10 bg-yellow/5 border border-yellow/20 group-hover:border-yellow/50 group-hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-yellow)_30%,transparent)] flex items-center justify-center text-yellow shrink-0 relative transition-all duration-300">
            <BookText className="w-5 h-5 relative z-10 opacity-60 group-hover:opacity-100 group-hover:scale-110 group-hover:animate-pulse transition-all duration-300" />
          </div>
          <div className="flex flex-col relative z-10">
            <span className="block text-[9px] font-mono text-text-dim group-hover:text-yellow/80 tracking-widest mb-1 uppercase transition-colors duration-300">CODEX</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-heading font-bold text-white group-hover:drop-shadow-[0_0_8px_var(--color-yellow)] group-hover:text-yellow transition-all duration-300">{user ? textbooksLength : '---'}</span>
              <span className="text-[10px] font-mono text-yellow/60 group-hover:text-yellow transition-colors duration-300">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Stat 5: SYS_STATUS (Combined Streak & Progress) */}
        <div className="bg-black/60 border border-panel-border hover:border-grey/50 p-3 relative group hover:bg-grey/5 transition-all duration-300 flex items-center gap-3 overflow-hidden cursor-default">
          <CyberBrackets color="border-grey/20 group-hover:border-grey transition-colors duration-300" />
          <div className="absolute left-0 top-0 w-1 h-full bg-grey scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-grey)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-grey/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          {/* Left Icon: Circular Progress (No Text) */}
          <div className="w-10 h-10 relative flex items-center justify-center shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
              <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" 
                strokeDasharray="100.5" strokeDashoffset={user ? (100.5 - (sysProgressPercent / 100) * 100.5) : 100.5}
                strokeLinecap="round"
                className="group-hover:stroke-grey group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-1000 ease-out" 
              />
            </svg>
            <Activity className="absolute w-4 h-4 text-grey/50 group-hover:text-grey group-hover:scale-110 group-hover:animate-pulse transition-all duration-300" />
          </div>

          {/* Right Content: Dual Rows */}
          <div className="flex flex-col relative z-10 w-full pr-1">
            {/* Row 1: STREAK */}
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-[9px] font-mono text-grey/50 group-hover:text-grey/80 transition-colors uppercase tracking-widest">STREAK</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-heading font-bold text-white group-hover:drop-shadow-[0_0_5px_var(--color-grey)] group-hover:text-grey transition-all">{user ? (userProgress?.current_streak || 0) : '---'}</span>
                <span className="text-[8px] font-mono text-grey/60 group-hover:text-grey transition-colors">CYC</span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-[1px] bg-white/10 group-hover:bg-grey/30 mb-1 transition-colors"></div>

            {/* Row 2: PROGRESS */}
            <div className="flex items-center justify-between w-full">
              <span className="text-[9px] font-mono text-grey/50 group-hover:text-grey/80 transition-colors uppercase tracking-widest">PROGRESS</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-heading font-bold text-white group-hover:drop-shadow-[0_0_5px_var(--color-grey)] group-hover:text-grey transition-all">{user ? sysProgressPercent : '--'}</span>
                <span className="text-[8px] font-mono text-grey/60 group-hover:text-grey transition-colors">%</span>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
