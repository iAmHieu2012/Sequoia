"use client";

import { useState } from "react";
import { User, LogOut, GitBranch, Shield, FileText, ChevronRight, ChevronLeft, X, Cpu, Activity, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";
import CyberPanel from "@/components/ui/CyberPanel";
import CyberButton from "@/components/ui/CyberButton";
import CyberBadge from "@/components/ui/CyberBadge";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { PRIVACY_CYBERPUNK, PRIVACY_LEGAL, TERMS_CYBERPUNK, TERMS_LEGAL, ABOUT_CYBERPUNK, ABOUT_LEGAL } from "@/constants/system";

interface CommandCenterPanelProps {
  /** Controls the visibility of the sliding panel */
  isOpen: boolean;
  /** Callback triggered when the panel requests to be closed */
  onClose: () => void;
}

/**
 * A comprehensive sliding panel that houses user identity configurations
 * and system policies (Privacy, Terms).
 */
export default function CommandCenterPanel({ isOpen, onClose }: CommandCenterPanelProps) {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [activeView, setActiveView] = useState<'main' | 'privacy' | 'terms' | 'about'>('main');
  const [isDecrypted, setIsDecrypted] = useState(false);

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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] transition-opacity"
        onClick={onClose}
      />
      
      {/* Sliding Panel */}
      <div className="fixed inset-0 bg-space-bg z-[100] flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
        
        {/* Scanline overlay for full screen */}
        <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_50%,#fff_50%)] bg-[length:100%_4px]" />
        
        {/* Universal Header */}
        <header className="flex-shrink-0 relative z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/70 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <CyberButton 
              onClick={onClose}
              variant="secondary"
              className="w-auto h-auto py-2"
            >
              <X className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              [ ESC ] CLOSE_PANEL
            </CyberButton>

            <div className="flex-col hidden sm:flex">
              <span className="text-xs font-mono text-white/70 tracking-widest uppercase">COMMAND_CENTER</span>
              <span className="text-sm font-mono font-bold text-white tracking-widest uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4 text-white" />
                IDENTITY_CONFIG
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-mono text-white/70 tracking-widest uppercase">SYS_STATUS</span>
              <span className="text-xs font-mono text-white tracking-widest uppercase flex items-center gap-2">
                PANEL_ACTIVE
                <span className="w-2 h-2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Grid or Document Viewer */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 relative z-10 flex flex-col">
          {activeView === 'main' ? (
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
          
            {/* Column 1: User Profile & Logout */}
            <div className="flex flex-col gap-6">
              <section className="space-y-4">
                <h3 className="font-mono text-xs text-white/40 tracking-[0.3em] uppercase border-b border-white/10 pb-2">
                  Active_User_Node
                </h3>
                <CyberPanel variant="glass" chamfer="tl-br" decorations="minimal" className="flex flex-col p-0 group overflow-hidden">
                  <div className="p-4 border-b border-white/10 bg-white/5 relative z-10">
                    <span className="text-xs font-mono text-white/70 tracking-widest">ID_CARD // {user?.id?.split('-')[0].toUpperCase() || "UNVERIFIED"}</span>
                  </div>
                  
                  <div className="p-4 flex flex-col md:flex-row gap-6 items-start md:items-center relative">
                    <div className="absolute inset-0 stripes-dark opacity-10 pointer-events-none" />
                    
                    {/* Avatar with targeting box */}
                    <div className="relative w-20 h-20 bg-space-bg border border-white/40 flex items-center justify-center shrink-0 group-hover:border-white group-hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300 z-10">
                      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white -translate-x-1 -translate-y-1" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white translate-x-1 translate-y-1" />
                      {user?.user_metadata?.avatar_url ? (
                        <Image src={user.user_metadata.avatar_url} alt="Avatar" width={80} height={80} unoptimized className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:brightness-110 transition-all duration-300" />
                      ) : (
                        <User className="w-8 h-8 text-white/40" />
                      )}
                    </div>

                    <div className="flex flex-col flex-1 relative z-10 w-full overflow-hidden">
                      <div className="flex items-end justify-between border-b border-white/10 pb-2 mb-3">
                        <div className="flex flex-col">
                          <span className="font-mono text-white font-bold uppercase tracking-widest text-xl drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] truncate">
                            {user?.user_metadata?.name || user?.email?.split('@')[0] || "GUEST_USER"}
                          </span>
                          <span className="font-mono text-white/40 text-xs uppercase tracking-widest truncate mt-1">
                            {user?.email || "NO_AUTH_EMAIL"}
                          </span>
                        </div>
                        <CyberBadge variant={isAdmin ? "solid" : "outline"} className="shrink-0 mb-1">
                          {isAdmin ? "LVL: OVERSEER" : "LVL: EXPLORER"}
                        </CyberBadge>
                      </div>

                      {/* Barcode based on UID */}
                      {user?.id ? (
                        <div className="flex items-center gap-[2px] h-8 opacity-70 group-hover:opacity-100 transition-opacity w-full overflow-hidden">
                          {user.id.replace(/-/g, '').substring(0, 32).split('').map((char, i) => {
                            const charCode = char.charCodeAt(0);
                            const width = (charCode % 4) + 1; // 1 to 4px
                            const isFaded = charCode % 3 === 0;
                            return (
                              <div key={i} style={{ minWidth: `${width}px`, width: `${width}px` }} className={`h-full bg-white ${isFaded ? 'opacity-40' : 'opacity-100'}`}></div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="h-8 border border-dashed border-white/40 flex items-center justify-center text-xs font-mono text-white/40">
                          NO_BIOMETRIC_DATA
                        </div>
                      )}
                    </div>
                  </div>
                </CyberPanel>
              </section>

              <section className="mt-4 flex flex-col gap-3">
                {isAdmin && (
                  <CyberButton 
                    variant="secondary"
                    onClick={() => {
                      onClose();
                      router.push('/genesis');
                    }}
                    className="group"
                  >
                    <Terminal className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    INITIATE_GENESIS
                  </CyberButton>
                )}

                <CyberButton 
                  variant="danger"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  TERMINATE_SESSION
                </CyberButton>
              </section>
            </div>

            {/* Column 2: System Info & Links */}
            <section className="space-y-4">
              <h3 className="font-mono text-xs text-white/40 tracking-[0.3em] uppercase border-b border-white/10 pb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Core_Protocols
              </h3>
              <div className="flex flex-col gap-2 font-mono">
                <a href="https://github.com/iamhieu2012/Sequoia" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-space-bg border border-white/10 border-l-2 hover:border-l-white hover:bg-white/10 transition-all group">
                  <div className="flex items-center gap-4 text-white/70 group-hover:text-white transition-colors">
                    <GitBranch className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                    <span className="text-xs uppercase tracking-[0.1em]">./execute source_repo.sh</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </a>
                <button onClick={() => { setActiveView('privacy'); setIsDecrypted(false); }} className="flex items-center justify-between p-3 bg-space-bg border border-white/10 border-l-2 hover:border-l-white hover:bg-white/10 transition-all group">
                  <div className="flex items-center gap-4 text-white/70 group-hover:text-white transition-colors">
                    <Shield className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                    <span className="text-xs uppercase tracking-[0.1em]">./read privacy_directive.log</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
                <button onClick={() => { setActiveView('terms'); setIsDecrypted(false); }} className="flex items-center justify-between p-3 bg-space-bg border border-white/10 border-l-2 hover:border-l-white hover:bg-white/10 transition-all group">
                  <div className="flex items-center gap-4 text-white/70 group-hover:text-white transition-colors">
                    <FileText className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                    <span className="text-xs uppercase tracking-[0.1em]">./read terms_of_service.log</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
                <button onClick={() => { setActiveView('about'); setIsDecrypted(false); }} className="flex items-center justify-between p-3 bg-space-bg border border-white/10 border-l-2 hover:border-l-white hover:bg-white/10 transition-all group">
                  <div className="flex items-center gap-4 text-white/70 group-hover:text-white transition-colors">
                    <Cpu className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                    <span className="text-xs uppercase tracking-[0.1em]">./execute about_sequoia.exe</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </section>
            
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full flex flex-col h-full animate-in slide-in-from-right-8 fade-in duration-500">
              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <button 
                  onClick={() => { setActiveView('main'); setIsDecrypted(false); }}
                  className="flex items-center gap-2 font-mono text-white/40 hover:text-white transition-colors uppercase tracking-[0.2em] text-xs group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> RETURN_TO_MAIN_NODE
                </button>
                <button 
                  onClick={() => setIsDecrypted(!isDecrypted)}
                  className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs uppercase tracking-widest border transition-all ${
                    isDecrypted 
                      ? "bg-coral/20 border-coral text-coral shadow-[0_0_10px_rgba(255,100,100,0.5)]" 
                      : "bg-white/10 border-white/40 text-white/70 hover:border-white hover:text-white"
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  {isDecrypted ? "[ DECRYPT PROTOCOL: ON ]" : "[ ENCRYPTED MODE ]"}
                </button>
              </div>
              <CyberPanel variant="glass" chamfer="tl-br" decorations="minimal" className="flex-1 overflow-y-auto group">
                <div className="relative z-10 p-4 md:p-8">
                  <MarkdownRenderer content={activeView === 'privacy' 
                    ? (isDecrypted ? PRIVACY_LEGAL : PRIVACY_CYBERPUNK)
                    : activeView === 'terms'
                      ? (isDecrypted ? TERMS_LEGAL : TERMS_CYBERPUNK)
                      : (isDecrypted ? ABOUT_LEGAL : ABOUT_CYBERPUNK)
                  } />
                </div>
              </CyberPanel>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
