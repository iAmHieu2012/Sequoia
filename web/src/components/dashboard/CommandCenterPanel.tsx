"use client";

import { useState, useEffect } from "react";
import { User, LogOut, Settings, Palette, GitBranch, Shield, FileText, ChevronRight, X, Cpu, Activity, Terminal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import CyberBrackets from "@/components/ui/CyberBrackets";

interface CommandCenterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEMES = [
  { id: "system", name: "DEFAULT_SYSTEM", hex: "#49aeae" },
  { id: "grey", name: "GREY", hex: "#808080" },
  { id: "red", name: "RED", hex: "#ff4242" },
  { id: "orange", name: "ORANGE", hex: "#ff9900" },
  { id: "yellow", name: "YELLOW", hex: "#ffff42" },
  { id: "green", name: "GREEN", hex: "#42ff42" },
  { id: "turquoise", name: "TURQUOISE", hex: "#00ff99" },
  { id: "cyan", name: "CYAN", hex: "#42ffff" },
  { id: "blue", name: "BLUE", hex: "#4242ff" },
  { id: "purple", name: "PURPLE", hex: "#9900ff" },
  { id: "pink", name: "PINK", hex: "#ff42ff" },
];

export default function CommandCenterPanel({ isOpen, onClose }: CommandCenterPanelProps) {
  const { user } = useAuth();
  const [activeTheme, setActiveTheme] = useState("system");
  const [wheelRotation, setWheelRotation] = useState(0);

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
      '--color-coral',
      '--color-orange',
      '--color-turquoise',
      '--color-purple',
      '--color-grey'
    ];

    if (activeTheme === "system") {
      colorVars.forEach(v => root.style.removeProperty(v));
    } else {
      const selectedHex = THEMES.find(t => t.id === activeTheme)?.hex;
      if (selectedHex) {
        colorVars.forEach(v => root.style.setProperty(v, selectedHex));
      }
    }
  }, [activeTheme]);

  // Calculate shortest path for wheel rotation
  useEffect(() => {
    const activeIndex = THEMES.filter(t => t.id !== "system" && t.id !== "grey").findIndex(t => t.id === activeTheme);
    if (activeIndex === -1) return;
    
    const targetAngle = -(activeIndex * 360) / 9;
    
    setWheelRotation(prev => {
      const currentMod = prev % 360;
      let diff = targetAngle - currentMod;
      
      // Normalize difference to [-180, 180] for shortest path
      if (diff > 180) diff -= 360;
      else if (diff < -180) diff += 360;
      
      return prev + diff;
    });
  }, [activeTheme]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    await signOut(auth);
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
        
        {/* Header */}
        <div className="p-6 border-b border-system/20 relative z-10 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-system">
              <Terminal className="w-6 h-6" />
              <span className="font-mono text-sm tracking-widest uppercase">Command Center</span>
            </div>
            <div className="w-px h-6 bg-system/30 mx-2" />
            <h2 className="text-3xl font-heading font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              Identity_Config
            </h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-system hover:bg-system/10 transition-colors p-2 border border-transparent hover:border-system/30">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 relative z-10 flex flex-col justify-center">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
          
            {/* Column 1: User Profile & Logout */}
            <div className="flex flex-col gap-6">
              <section className="space-y-4">
                <h3 className="text-xs text-text-dim tracking-[0.3em] uppercase border-b border-white/10 pb-2">Active_User_Node</h3>
                <div className="flex flex-col gap-4 bg-system/5 border border-system/20 p-4 relative group">
                  <CyberBrackets color="border-system/40" />
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-system/10 border border-system flex items-center justify-center shrink-0 shadow-[0_0_10px_var(--color-system)]">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-system" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 overflow-hidden py-1">
                      <span className="text-white font-bold truncate text-lg">
                        {user?.displayName || "GUEST_USER"}
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
              
              <div className="flex flex-col items-center justify-center bg-black/60 border border-white/10 py-6 px-4 relative overflow-hidden group">
                <CyberBrackets color="border-white/10 group-hover:border-system/40 transition-colors" />
                
                {/* Cyberpunk Dial Color Picker */}
                <div className="relative w-48 h-48 flex items-center justify-center mb-6 mt-2">
                  {/* Radar decorations */}
                  <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_60s_linear_infinite]" />
                  <div className="absolute inset-6 border border-white/20 border-dashed rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                  
                  {/* Crosshairs */}
                  <div className="absolute w-full h-[1px] bg-white/10 pointer-events-none" />
                  <div className="absolute h-full w-[1px] bg-white/10 pointer-events-none" />
                  
                  {/* Center Visual Core (Indicator Only) */}
                  <div className="relative z-20 w-14 h-14 rounded-full flex items-center justify-center">
                    {activeTheme === "system" ? (
                      <>
                        <div 
                          className="absolute inset-0 rounded-full animate-[spin_10s_linear_infinite]"
                          style={{
                            background: "conic-gradient(#ff4242, #ff9900, #ffff42, #42ff42, #00ff99, #42ffff, #4242ff, #9900ff, #ff42ff, #ff4242)",
                            boxShadow: "0 0 20px rgba(255,255,255,0.3)"
                          }}
                        />
                        <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center bg-[#111] shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
                          <div className="w-3 h-3 rounded-full bg-white/20" />
                        </div>
                      </>
                    ) : (
                      <div 
                        className="absolute inset-0 rounded-full transition-all duration-500 flex items-center justify-center"
                        style={{ 
                          backgroundColor: THEMES.find(t => t.id === activeTheme)?.hex || "#808080",
                          boxShadow: `0 0 20px ${THEMES.find(t => t.id === activeTheme)?.hex || "#808080"}`
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-white/70" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rotating Wheel Container */}
                  <div 
                    className="absolute w-full h-full flex items-center justify-center transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ transform: `rotate(${wheelRotation}deg)` }}
                  >
                    {/* 9 Outer Radial Ticks */}
                    {THEMES.filter(t => t.id !== "system" && t.id !== "grey").map((theme, index) => {
                      const angle = (index * 360) / 9; // 9 items
                      const physicalAngle = angle - 90; // Start at -90 degrees (12 o'clock)
                      const radian = physicalAngle * (Math.PI / 180); 
                      const radius = 68; // px distance from center (scaled down for fit)
                      const x = Math.cos(radian) * radius;
                      const y = Math.sin(radian) * radius;
                      
                      const isSelected = activeTheme === theme.id;
                      
                      return (
                        <button
                          key={theme.id}
                          onClick={() => setActiveTheme(theme.id)}
                          className={`absolute transition-all duration-300 z-10 flex items-center justify-center ${isSelected ? "w-10 h-3 z-30" : "w-6 h-1.5 hover:w-8 hover:h-2"}`}
                          style={{ 
                            backgroundColor: theme.hex,
                            // Rotate by physicalAngle to ensure it points radially towards the center
                            transform: `translate(${x}px, ${y}px) rotate(${physicalAngle}deg)`,
                            boxShadow: isSelected ? `0 0 15px ${theme.hex}` : `0 0 5px ${theme.hex}`,
                            border: isSelected ? "1px solid white" : "none",
                            clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0 100%)" // Slanted edges for cyberpunk feel
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Active Theme Display */}
                <div className="text-center relative z-10 bg-black/80 px-4 py-1.5 border border-white/10 w-full max-w-[240px]">
                  <div className="text-[9px] text-white/40 uppercase tracking-[0.4em] mb-1">Active_Frequency</div>
                  <div 
                    className="text-sm font-heading font-black tracking-[0.3em] uppercase transition-colors duration-300 truncate"
                    style={{ 
                      color: THEMES.find(t => t.id === activeTheme)?.hex,
                      textShadow: `0 0 8px ${THEMES.find(t => t.id === activeTheme)?.hex}`
                    }}
                  >
                    [{THEMES.find(t => t.id === activeTheme)?.name}]
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-4 relative z-10 w-full">
                  <button 
                    onClick={() => setActiveTheme("grey")}
                    className={`flex-1 min-w-[100px] px-3 py-1.5 border text-[9px] font-bold tracking-[0.15em] uppercase transition-all flex justify-center items-center gap-2
                      ${activeTheme === 'grey' 
                        ? 'bg-[#808080]/20 border-[#808080] text-[#808080] shadow-[0_0_10px_#808080]' 
                        : 'bg-white/5 border-white/20 text-white/50 hover:text-white hover:border-white/50'
                      }`}
                  >
                    <Activity className="w-3 h-3 shrink-0" />
                    Grayscale
                  </button>

                  <button 
                    onClick={() => setActiveTheme("system")}
                    className={`flex-1 min-w-[100px] px-3 py-1.5 border text-[9px] font-bold tracking-[0.15em] uppercase transition-all flex justify-center items-center gap-2
                      ${activeTheme === 'system' 
                        ? 'bg-system/20 border-system text-system shadow-[0_0_10px_var(--color-system)]' 
                        : 'bg-white/5 border-white/20 text-white/50 hover:text-white hover:border-white/50'
                      }`}
                  >
                    <Activity className="w-3 h-3 shrink-0" />
                    Colorful
                  </button>
                </div>
              </div>
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
                <button className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all group">
                  <div className="flex items-center gap-4 text-white/50 group-hover:text-white">
                    <Shield className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-[0.1em]">Privacy Directive</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-system group-hover:translate-x-1 transition-all" />
                </button>
                <button className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all group">
                  <div className="flex items-center gap-4 text-white/50 group-hover:text-white">
                    <FileText className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-[0.1em]">Terms of Service</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-system group-hover:translate-x-1 transition-all" />
                </button>
                <button className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition-all group">
                  <div className="flex items-center gap-4 text-white/50 group-hover:text-white">
                    <Cpu className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-[0.1em]">About Sequoia</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-system group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-system/20 bg-black/80 relative z-10">
          <div className="text-center text-[10px] text-system/30 font-mono tracking-[0.3em] uppercase">
            Sequoia Nexus v1.0.0 // Identity Control Subsystem // System Normal
          </div>
        </div>
      </div>
    </>
  );
}
