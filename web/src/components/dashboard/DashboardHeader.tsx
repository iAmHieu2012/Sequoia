"use client";

import { useState, useEffect } from "react";
import { Orbit } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";

export default function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="relative z-50 flex items-center justify-between px-6 py-3 border-b border-panel-border uppercase tracking-wider">
      <div className="flex items-center gap-3">
        <Orbit className="w-5 h-5 text-system animate-[spin_20s_linear_infinite]" />
        <div>
          <div className="flex items-center gap-2 mb-1 text-system">
            <span className="font-mono text-[10px] tracking-[0.3em]">SYS.CMD.CENTER // ROOT</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-black text-white tracking-[0.15em] m-0 leading-none drop-shadow-[0_0_10px_var(--color-system)]">
            SEQUOIA
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-black/80 border border-system/30 px-4 py-2 relative hidden md:block w-[180px]">
          <CyberBrackets />
          <span className="block text-[9px] font-mono text-text-dim mb-1">LOCAL_TIME</span>
          <span className="text-xs font-mono text-system flex items-center gap-2 font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 bg-system shadow-[0_0_8px_var(--color-system)] animate-pulse" />
            {currentTime ? currentTime.toLocaleString('en-US', { hour12: false, month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'SYNCING...'}
          </span>
        </div>
      </div>
    </header>
  );
}
