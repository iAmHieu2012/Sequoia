"use client";

import { useState, useEffect } from "react";
import { User as UserIcon, Cpu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { useAuth } from "@/contexts/AuthContext";
import CommandCenterPanel from "./CommandCenterPanel";
import CyberButton from "@/components/ui/CyberButton";

export default function DashboardHeader({ error }: { error?: string | null }) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="relative z-50 flex items-center justify-between h-16 md:h-20 border-b border-white/10 bg-space-bg uppercase tracking-wider select-none">
      
      {/* LEFT: Logo & System Identity */}
      <div className="flex items-center gap-4 px-4">
        <Image src="/bot.png" alt="Sequoia Bot" width={40} height={40} unoptimized className="w-20 h-20" />
          
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white text-space-bg px-4 py-0.5 text-xs font-mono tracking-widest clip-chamfer-tl-br">
                ROOT_NODE
              </span>
              <span className="font-mono text-xs tracking-[0.2em] text-white/40 hidden lg:block">
                {"// SYS.CMD.CENTER"}
              </span>
            </div>
            <h1 className="text-xl md:text-3xl font-display font-black text-white tracking-[0.15em] m-0 leading-none">
              SEQUOIA
            </h1>
          </div>
      </div>

      {/* RIGHT: Status & User Panel */}
      <div className="flex items-center gap-2 md:gap-6 px-4">
        
        {/* Status Box - Hidden on small screens */}
        <div className="hidden lg:flex items-center gap-6 px-4 py-2 border border-white/10 bg-white/10 relative">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white"></div>

          <div className="flex flex-col">
            <span className="text-xs font-mono text-white/40 mb-1 tracking-widest">SYS_STATUS</span>
            <span className={`text-xs font-mono flex items-center gap-2 font-bold tracking-wider ${error ? 'text-coral' : 'text-white'}`}>
              <span className={`w-2 h-2 animate-pulse ${error ? 'bg-coral shadow-[0_0_8px_var(--color-coral)]' : 'bg-white shadow-[0_0_8px_white]'}`} />
              {error ? 'FAULT DETECTED' : 'OPTIMAL'}
            </span>
          </div>

          <div className="w-px h-8 bg-white/10" />

          <div className="flex flex-col min-w-[140px]">
            <span className="text-xs font-mono text-white/40 mb-1 tracking-widest">LOCAL_TIME</span>
            <span className="text-xs font-mono text-white flex items-center gap-2 font-bold tracking-wider">
              {currentTime ? currentTime.toLocaleString('en-US', { hour12: false, month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'SYNCING...'}
            </span>
          </div>
        </div>

        {/* User Identity / Command Center Toggle */}
        <div className="flex items-center">
          {user ? (
            <button 
              onClick={() => setIsCommandCenterOpen(true)}
              className="h-10 md:h-12 bg-white text-space-bg pl-4 md:pl-6 pr-0 flex items-center clip-chamfer-tl-br hover:bg-gray-200 transition-colors group overflow-hidden"
            >
              <div className="flex-col items-end text-right hidden sm:flex mr-4 relative z-10">
                <span className="text-xs font-mono text-space-bg/70 tracking-widest font-bold">ID_ENTITY</span>
                <span className="text-xs font-mono font-black tracking-widest">
                  {user.user_metadata?.name?.toUpperCase() || user.email?.split('@')[0].toUpperCase() || 'USER_NODE'}
                </span>
              </div>
              
              {/* Partitioned Icon Box with Stripes */}
              <div className="h-full w-10 md:w-12 flex items-center justify-center relative border-l border-space-bg/10">
                <div className="absolute inset-0 stripes-dark opacity-10"></div>
                <UserIcon className="w-4 h-4 md:w-5 md:h-5 relative z-10" />
              </div>
            </button>
          ) : (
            <Link href="/auth" className="flex items-center">
              <CyberButton variant="secondary" className="h-10 text-xs">
                <Cpu className="w-4 h-4 mr-2" />
                ESTABLISH
              </CyberButton>
            </Link>
          )}
        </div>
      </div>

      <CommandCenterPanel 
        isOpen={isCommandCenterOpen} 
        onClose={() => setIsCommandCenterOpen(false)} 
      />
    </header>
  );
}
