"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ArrowRight, Sparkles, Network, Orbit } from 'lucide-react';

import CyberBrackets from '@/components/ui/CyberBrackets';

export default function LandingClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEnterSystem = () => {
    if (loading) return;
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-space-bg flex flex-col items-center justify-center p-4 relative overflow-hidden text-text-main font-sans select-none">
      
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-50" style={{
        backgroundImage: 'linear-gradient(color-mix(in srgb, var(--color-system) 3%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-system) 3%, transparent) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Center Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] rounded-full bg-system/5 blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
        
        <div className="flex items-center gap-3 mb-6">
          <Orbit className="w-10 h-10 text-system animate-[spin_20s_linear_infinite]" />
          <span className="font-mono text-xs md:text-sm tracking-[0.4em] text-system">
            SYS.CORE.INITIALIZED
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black text-white tracking-[0.15em] m-0 mb-4 leading-none drop-shadow-[0_0_20px_var(--color-system)]">
          SEQUOIA
        </h1>
        
        <h2 className="text-xl md:text-3xl font-heading text-white/80 tracking-widest uppercase mb-8">
          The <span className="text-system">Neural</span> Cosmos
        </h2>

        <div className="max-w-2xl bg-black/40 border border-panel-border p-6 relative group mb-12">
          <CyberBrackets color="border-system/30 group-hover:border-system/60 transition-colors duration-500" />
          <p className="text-text-dim text-sm md:text-base font-mono tracking-wider leading-relaxed">
            Welcome to the next evolution of AI education. Traverse the neural pathways, decode complex machine learning models directly on your device, and map the unexplored sectors of artificial intelligence.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-sm justify-center">
          <button 
            onClick={handleEnterSystem}
            disabled={loading}
            className={`w-full py-4 px-8 relative group overflow-hidden border transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed border-system/10 bg-transparent' : 'bg-system/10 border-system/30 hover:bg-system/20'}`}
          >
            {!loading && <div className="absolute left-0 top-0 w-1 h-full bg-system scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out" />}
            <span className="relative z-10 flex items-center justify-center font-heading font-bold tracking-[0.2em] text-system text-sm uppercase">
              {loading ? "INITIALIZING..." : "ENTER_SYSTEM"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />}
            </span>
            {!loading && <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-system/20 to-transparent transition-transform duration-700 ease-out pointer-events-none" />}
          </button>
        </div>

      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-8 left-8 flex items-center gap-2 text-text-dim/50 font-mono text-[10px] tracking-widest hidden md:flex">
        <Network className="w-4 h-4" />
        <span>NODE: ONLINE</span>
      </div>
      <div className="absolute bottom-8 right-8 flex items-center gap-2 text-text-dim/50 font-mono text-[10px] tracking-widest hidden md:flex">
        <Sparkles className="w-4 h-4" />
        <span>V 2.0.26</span>
      </div>
    </div>
  );
}
