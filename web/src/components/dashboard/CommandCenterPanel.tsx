"use client";

import { useState, useEffect } from "react";
import { User, LogOut, Palette, GitBranch, Shield, FileText, ChevronRight, ChevronLeft, X, Cpu, Activity, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";
import CyberBrackets from "@/components/ui/CyberBrackets";
import ThemeSelector from "./ThemeSelector";
import { THEMES, PRIVACY_CYBERPUNK, PRIVACY_LEGAL, TERMS_CYBERPUNK, TERMS_LEGAL, ABOUT_CYBERPUNK, ABOUT_LEGAL } from "@/constants/system";

interface CommandCenterPanelProps {
  /** Controls the visibility of the sliding panel */
  isOpen: boolean;
  /** Callback triggered when the panel requests to be closed */
  onClose: () => void;
}

/**
 * A comprehensive sliding panel that houses user identity configurations,
 * theme personalization (via ThemeSelector), and system policies (Privacy, Terms).
 */
export default function CommandCenterPanel({ isOpen, onClose }: CommandCenterPanelProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTheme, setActiveTheme] = useState(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )sequoia_theme=([^;]*)/);
      if (match) return decodeURIComponent(match[1]);
    }
    return "system";
  });
  const [activeView, setActiveView] = useState<'main' | 'privacy' | 'terms' | 'about'>('main');
  const [isDecrypted, setIsDecrypted] = useState(false);



  useEffect(() => {
    const root = document.documentElement;
    const colorVars = [
      '--color-system',
      '--color-red',
      '--color-green',
      '--color-blue',
      '--color-yellow',
      '--color-pink',
      '--color-cyan',
      '--color-orange',
      '--color-turquoise',
      '--color-purple',
      '--color-grey'
    ];

    if (activeTheme === "system") {
      colorVars.forEach(v => root.style.removeProperty(v));
      document.cookie = "sequoia_theme=system; path=/; max-age=31536000";
    } else {
      const selectedHex = THEMES.find(t => t.id === activeTheme)?.hex;
      if (selectedHex) {
        colorVars.forEach(v => root.style.setProperty(v, selectedHex));
        document.cookie = `sequoia_theme=${activeTheme}; path=/; max-age=31536000`;
      }
    }
    router.refresh();
  }, [activeTheme, router]);

    if (!isOpen) return null;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity"
        onClick={onClose}
      />
      
      {/* Sliding Panel */}
      <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
        
        {/* Scanline overlay for full screen */}
        <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_50%,#fff_50%)] bg-[length:100%_4px]" />
        
        {/* Universal Header */}
        <header className="flex-shrink-0 relative z-50 flex items-center justify-between px-6 py-4 border-b border-system/20 bg-black/80 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <button 
              onClick={onClose}
              className="inline-flex items-center text-[10px] font-mono tracking-widest uppercase bg-system/5 text-system px-4 py-2 hover:bg-system/20 hover:text-white transition-all duration-300 relative group overflow-hidden"
            >
              <CyberBrackets color="border-system/30 group-hover:border-system transition-colors duration-300" />
              <div className="absolute left-0 top-0 w-1 h-full bg-system scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-system)]" />
              <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-system/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
              <span className="relative z-10 flex items-center gap-1 group-hover:drop-shadow-[0_0_8px_var(--color-system)]">
                <X className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                [ ESC ] CLOSE_PANEL
              </span>
            </button>

            <div className="flex-col hidden sm:flex">
              <span className="text-[9px] font-mono text-system/60 tracking-widest uppercase">COMMAND_CENTER</span>
              <span className="text-sm font-heading font-bold text-white tracking-widest uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4 text-system" />
                IDENTITY_CONFIG
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-mono text-system/60 tracking-widest uppercase">SYS_STATUS</span>
              <span className="text-xs font-mono text-system tracking-widest uppercase flex items-center gap-2">
                PANEL_ACTIVE
                <span className="w-2 h-2 bg-system shadow-[0_0_8px_var(--color-system)] animate-pulse" />
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Grid or Document Viewer */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 relative z-10 flex flex-col justify-center">
          {activeView === 'main' ? (
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono animate-in fade-in duration-500">
          
            {/* Column 1: User Profile & Logout */}
            <div className="flex flex-col gap-6">
              <section className="space-y-4">
                <h3 className="text-xs text-text-dim tracking-[0.3em] uppercase border-b border-white/10 pb-2">Active_User_Node</h3>
                <div className="flex flex-col gap-4 bg-system/5 border border-system/20 p-4 relative group">
                  <CyberBrackets color="border-system/40" />
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-system/10 border border-system flex items-center justify-center shrink-0 shadow-[0_0_10px_var(--color-system)]">
                      {user?.user_metadata?.avatar_url ? (
                        <Image src={user.user_metadata.avatar_url} alt="Avatar" width={64} height={64} unoptimized className="object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-system" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden py-1">
                      <span className="text-white font-bold truncate text-lg">
                        {user?.user_metadata?.name || user?.email?.split('@')[0] || "GUEST_USER"}
                      </span>
                      <span className="text-system/70 text-xs truncate">
                        {user?.email || "NO_AUTH_EMAIL"}
                      </span>
                      <span className="inline-block mt-2 bg-system text-black font-bold text-[10px] px-2 py-0.5 w-fit border border-system uppercase tracking-widest shadow-[0_0_10px_var(--color-system)]">
                        Level: EXPLORER
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-4">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 p-3 border border-coral/30 hover:border-coral bg-coral/5 hover:bg-coral/20 text-coral text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_transparent] hover:shadow-[0_0_15px_var(--color-coral)]"
                >
                  <LogOut className="w-4 h-4" />
                  Terminate_Session
                </button>
              </section>
            </div>

            {/* Column 2: Theme Personalization */}
            <section className="space-y-4">
              <h3 className="text-xs text-text-dim tracking-[0.3em] uppercase border-b border-white/10 pb-2 flex items-center gap-2">
                <Palette className="w-4 h-4" /> System_Theme
              </h3>
              
              <ThemeSelector activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
            </section>

            {/* Column 3: System Info & Links */}
            <section className="space-y-4">
              <h3 className="text-xs text-text-dim tracking-[0.3em] uppercase border-b border-white/10 pb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Core_Protocols
              </h3>
              <div className="flex flex-col gap-2">
                <a href="https://github.com/iamhieu2012/Sequoia" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all group">
                  <div className="flex items-center gap-4 text-white/50 group-hover:text-white">
                    <GitBranch className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-[0.1em]">Source Repository</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-system group-hover:translate-x-1 transition-all" />
                </a>
                <button onClick={() => { setActiveView('privacy'); setIsDecrypted(false); }} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all group">
                  <div className="flex items-center gap-4 text-white/50 group-hover:text-white">
                    <Shield className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-[0.1em]">Privacy Directive</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-system group-hover:translate-x-1 transition-all" />
                </button>
                <button onClick={() => { setActiveView('terms'); setIsDecrypted(false); }} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all group">
                  <div className="flex items-center gap-4 text-white/50 group-hover:text-white">
                    <FileText className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-[0.1em]">Terms of Service</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-system group-hover:translate-x-1 transition-all" />
                </button>
                <button onClick={() => { setActiveView('about'); setIsDecrypted(false); }} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all group">
                  <div className="flex items-center gap-4 text-white/50 group-hover:text-white">
                    <Cpu className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-[0.1em]">About Sequoia</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-system group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </section>
            
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full flex flex-col font-mono h-full animate-in slide-in-from-right-8 fade-in duration-500">
              <div className="flex items-center justify-between mb-8 border-b border-white/20 pb-4">
                <button 
                  onClick={() => { setActiveView('main'); setIsDecrypted(false); }}
                  className="flex items-center gap-2 text-system hover:text-white transition-colors uppercase tracking-[0.2em] text-xs group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Return to Main Node
                </button>
                <button 
                  onClick={() => setIsDecrypted(!isDecrypted)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-all ${
                    isDecrypted 
                      ? "bg-coral/20 border-coral text-coral shadow-[0_0_10px_rgba(255,100,100,0.5)]" 
                      : "bg-system/10 border-system/50 text-system hover:border-system"
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  {isDecrypted ? "[ DECRYPT PROTOCOL: ON ]" : "[ ENCRYPTED MODE ]"}
                </button>
              </div>
              <div className="flex-1 bg-black/60 border border-white/10 p-8 relative overflow-y-auto group">
                <CyberBrackets color="border-system/30 transition-colors duration-500" />
                <div className="relative z-10 text-sm leading-loose tracking-wider text-white/80 whitespace-pre-wrap">
                  {activeView === 'privacy' 
                    ? (isDecrypted ? PRIVACY_LEGAL : PRIVACY_CYBERPUNK)
                    : activeView === 'terms'
                      ? (isDecrypted ? TERMS_LEGAL : TERMS_CYBERPUNK)
                      : (isDecrypted ? ABOUT_LEGAL : ABOUT_CYBERPUNK)
                  }
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
