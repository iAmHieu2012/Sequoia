"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Sparkles, Network } from 'lucide-react';
import Image from 'next/image';
import CyberGrid from '@/components/ui/CyberGrid';

import CyberBrackets from '@/components/ui/CyberBrackets';

export default function LandingClient() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleEnterSystem = () => {
    if (loading) return;
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="min-h-dvh h-dvh bg-space-bg flex flex-col items-center justify-center px-4 py-8 md:py-12 relative overflow-hidden text-text-main font-sans select-none">
      
      <CyberGrid />

      {/* Center Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] md:w-[50vw] md:h-[50vw] rounded-full bg-system/5 blur-[100px] md:blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
        
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <Image src="/bot-idle.gif" alt="Sequoia Bot" width={48} height={48} unoptimized className="object-contain w-8 h-8 md:w-12 md:h-12" />
          <span className="font-mono text-[10px] md:text-sm tracking-[0.3em] md:tracking-[0.4em] text-system">
            SYS.CORE.INITIALIZED
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-black text-white tracking-widest md:tracking-[0.15em] m-0 mb-3 md:mb-4 leading-none drop-shadow-[0_0_15px_var(--color-system)] md:drop-shadow-[0_0_20px_var(--color-system)]">
          SEQUOIA
        </h1>
        
        <h2 className="text-lg sm:text-xl md:text-3xl font-heading text-white/80 tracking-widest uppercase mb-6 md:mb-8 [@media(max-height:400px)]:mb-4">
          The <span className="text-system">Neural</span> Cosmos
        </h2>

        {/* Hide this descriptive text on very short screens (landscape) to maintain 100dvh lock without scrolling */}
        <div className="w-full max-w-2xl bg-black/60 md:bg-black/40 border border-panel-border p-4 md:p-6 relative group mb-8 md:mb-12 [@media(max-height:550px)]:hidden">
          <CyberBrackets color="border-system/30 group-hover:border-system/60 transition-colors duration-500" />
          <p className="text-text-dim text-xs sm:text-sm md:text-base font-mono tracking-wider md:tracking-wider leading-relaxed text-justify md:text-center">
            Welcome to the next evolution of AI education. Traverse the neural pathways, decode complex machine learning models directly on your device, and map the unexplored sectors of artificial intelligence.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-xs sm:max-w-sm justify-center">
          <button 
            onClick={handleEnterSystem}
            disabled={loading}
            className={`w-full py-3 md:py-4 px-6 md:px-8 relative group overflow-hidden border transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed border-system/10 bg-transparent' : 'bg-system/10 border-system/30 hover:bg-system/20'}`}
          >
            {!loading && <div className="absolute left-0 top-0 w-1 h-full bg-system scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out" />}
            <span className="relative z-10 flex items-center justify-center font-heading font-bold tracking-[0.15em] md:tracking-[0.2em] text-system text-xs md:text-sm uppercase">
              {loading ? "INITIALIZING..." : "ENTER_SYSTEM"}
              {!loading && <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4 opacity-70 group-hover:translate-x-1 transition-transform" />}
            </span>
            {!loading && <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] bg-linear-to-r from-transparent via-system/20 to-transparent transition-transform duration-700 ease-out pointer-events-none" />}
          </button>
        </div>

      </div>

      {/* Decorative Elements - Hidden on short screens to avoid overlap */}
      <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 flex items-center gap-1.5 md:gap-2 text-text-dim/40 md:text-text-dim/50 font-mono text-[8px] md:text-[10px] tracking-widest [@media(max-height:450px)]:hidden">
        <Network className="w-3 h-3 md:w-4 md:h-4" />
        <span>NODE: ONLINE</span>
      </div>
      <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 flex items-center gap-1.5 md:gap-2 text-text-dim/40 md:text-text-dim/50 font-mono text-[8px] md:text-[10px] tracking-widest [@media(max-height:450px)]:hidden">
        <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
        <span>V 2.0.26</span>
      </div>
    </div>
  );
}
