"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import CyberGrid from '@/components/ui/CyberGrid';
import StarField from '@/components/ui/StarField';
import CyberPanel from '@/components/ui/CyberPanel';

export default function LandingClient() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [bootText, setBootText] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [glitchActive, setGlitchActive] = useState(true);

  const fullBootText = 'SYS.CORE.INITIALIZED';

  // Typing animation for boot text
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setBootText(fullBootText.slice(0, index + 1));
      index++;
      if (index >= fullBootText.length) {
        clearInterval(timer);
        setTimeout(() => setShowContent(true), 400);
      }
    }, 70);
    return () => clearInterval(timer);
  }, []);

  // Glitch effect — plays for 1.5s on load then stops
  useEffect(() => {
    const timer = setTimeout(() => setGlitchActive(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleEnterSystem = () => {
    if (loading) return;
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="min-h-dvh h-dvh bg-space-bg flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden text-white font-sans select-none">
      
      {/* Background Layers */}
      <StarField />
      <CyberGrid />
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.04]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 4px)',
        backgroundSize: '100% 4px',
      }} />

      {/* Center Glows */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] md:w-[50vw] md:h-[50vw] rounded-full bg-white/5 blur-[120px] pointer-events-none animate-pulse" 
        style={{ animationDuration: '6s' }} 
      />

      {/* Orbital Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[480px] md:h-[480px] rounded-full border border-white/[0.05] animate-[spin_50s_linear_infinite] pointer-events-none z-[2]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[680px] md:h-[680px] rounded-full border border-dashed border-white/[0.04] animate-[spin_80s_linear_infinite_reverse] pointer-events-none z-[2]" />

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
        
        {/* Boot Status Line */}
        <div className="flex items-center gap-3 mb-6">
          <Image src="/bot-idle.gif" alt="Sequoia Bot" width={48} height={48} unoptimized className="object-contain w-10 h-10 md:w-12 md:h-12 border border-white/20 clip-chamfer-tl-br p-1" />
          <div className="flex flex-col items-start text-left">
            <span className="bg-white text-space-bg px-5 py-0.5 text-xs font-bold tracking-widest uppercase clip-chamfer-tl-br mb-1">
              SYSTEM_STATUS
            </span>
            <span className="font-mono text-xs sm:text-sm tracking-[0.3em] md:tracking-[0.4em] text-white/70">
              {bootText}<span className="animate-pulse font-light text-white">_</span>
            </span>
          </div>
        </div>

        {/* Title with Hard Sci-Fi Glitch */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black text-white tracking-widest md:tracking-[0.15em] m-0 mb-4 leading-none relative">
          {glitchActive && (
            <>
              <span 
                className="absolute inset-0 text-white/70 animate-[glitch-1_0.15s_steps(2)_infinite]" 
                aria-hidden="true" 
                style={{ clipPath: 'inset(15% 0 60% 0)' }}
              >
                SEQUOIA
              </span>
              <span 
                className="absolute inset-0 text-white/40 animate-[glitch-2_0.2s_steps(3)_infinite_reverse]" 
                aria-hidden="true" 
                style={{ clipPath: 'inset(55% 0 10% 0)' }}
              >
                SEQUOIA
              </span>
            </>
          )}
          SEQUOIA
        </h1>
        
        <div className="flex items-center gap-4 mb-8 md:mb-12">
          <div className="h-[2px] w-12 bg-white/30 hidden md:block"></div>
          <h2 className="text-sm md:text-xl font-mono text-white/70 tracking-[0.3em] uppercase">
            THE <span className="text-white font-bold">NEURAL</span> COSMOS
          </h2>
          <div className="h-[2px] w-12 bg-white/30 hidden md:block"></div>
        </div>

        {/* Description Panel */}
        <div className={`w-full max-w-2xl mb-10 transition-all duration-700 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <CyberPanel variant="solid-dark" chamfer="all" decorations="brackets" className="p-6 md:p-8 relative">
            <p className="text-white/70 text-xs sm:text-sm font-mono tracking-wider md:tracking-widest leading-relaxed text-justify md:text-center relative z-10">
              Welcome to the next evolution of AI education. Traverse the neural pathways, decode complex machine learning models directly on your device, and map the unexplored sectors of artificial intelligence.
            </p>
          </CyberPanel>
        </div>

        {/* CTA Button */}
        <div className={`w-full max-w-sm transition-all duration-700 ease-out delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button 
            onClick={handleEnterSystem}
            disabled={loading}
            className="group relative h-14 md:h-16 w-full bg-white text-space-bg flex items-center justify-between px-4 sm:px-6 clip-chamfer-tl-br hover:bg-gray-200 transition-colors border-none outline-none"
          >
            {/* Background Decorative Stripes */}
            <div className="absolute top-0 right-0 w-24 h-full stripes-dark opacity-10"></div>
            
            <div className="flex items-center gap-3 md:gap-4 relative z-10">
              {/* Left Accent Lines */}
              <div className="flex flex-col gap-1 opacity-60">
                <div className="w-4 md:w-6 h-[2px] bg-space-bg"></div>
                <div className="w-2 md:w-4 h-[2px] bg-space-bg"></div>
              </div>
              <span className="font-mono font-black text-xs sm:text-sm md:text-base tracking-[0.2em] uppercase">
                {loading ? "INITIALIZING..." : "ENTER_SYSTEM"}
              </span>
            </div>
            
            {/* Right Action Icon Box */}
            {!loading && (
              <div className="relative z-10 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border-2 border-space-bg/20 group-hover:border-space-bg group-hover:bg-space-bg group-hover:text-white transition-all duration-300">
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            )}
          </button>
        </div>

        {/* Decorative Bottom Bar */}
        <div className="w-full max-w-md mt-16 flex items-center justify-center gap-4 opacity-40">
          <div className="flex-1 h-[1px] bg-white"></div>
          <div className="w-12 h-2 stripes-light"></div>
          <span className="text-xs font-mono tracking-widest uppercase">NAV-VECTOR // 0x00A</span>
          <div className="w-12 h-2 stripes-light"></div>
          <div className="flex-1 h-[1px] bg-white"></div>
        </div>

      </main>

      {/* Glitch Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes glitch-1 {
          0% { transform: translate(0); }
          25% { transform: translate(-4px, 1px); }
          50% { transform: translate(4px, -2px); }
          75% { transform: translate(-2px, 2px); }
          100% { transform: translate(0); }
        }
        @keyframes glitch-2 {
          0% { transform: translate(0); }
          25% { transform: translate(3px, -1px); }
          50% { transform: translate(-4px, 2px); }
          75% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
      `}} />
    </div>
  );
}
