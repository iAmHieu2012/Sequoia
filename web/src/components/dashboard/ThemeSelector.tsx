import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";
import { THEMES } from "@/constants/system";

interface ThemeSelectorProps {
  /** The currently active theme ID */
  activeTheme: string;
  /** Callback to change the global system theme */
  setActiveTheme: (theme: string) => void;
}

/**
 * A highly interactive, cyberpunk-styled radial dial for selecting the global system theme.
 * Renders an animated rotating wheel of available theme colors.
 */
export default function ThemeSelector({ activeTheme, setActiveTheme }: ThemeSelectorProps) {
  const [wheelRotation, setWheelRotation] = useState(0);

  // Calculate shortest path for wheel rotation
  useEffect(() => {
    const activeIndex = THEMES.filter(t => t.id !== "system" && t.id !== "grey").findIndex(t => t.id === activeTheme);
    if (activeIndex === -1) return;
    
    const targetAngle = -(activeIndex * 360) / 9;
    
    requestAnimationFrame(() => {
      setWheelRotation(prev => {
        const currentMod = prev % 360;
        let diff = targetAngle - currentMod;
        
        if (diff > 180) diff -= 360;
        else if (diff < -180) diff += 360;
        
        return prev + diff;
      });
    });
  }, [activeTheme]);

  return (
    <div className="flex flex-col items-center justify-center bg-black/60 border border-white/10 py-6 px-4 relative overflow-hidden group">
      <CyberBrackets color="border-white/10 group-hover:border-system/40 transition-colors" />
      
      {/* Cyberpunk Dial Color Picker */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-6 mt-2">
        <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute inset-6 border border-white/20 border-dashed rounded-full animate-[spin_40s_linear_infinite_reverse]" />
        
        <div className="absolute w-full h-[1px] bg-white/10 pointer-events-none" />
        <div className="absolute h-full w-[1px] bg-white/10 pointer-events-none" />
        
        <div className="relative z-20 w-14 h-14 rounded-full flex items-center justify-center">
          {activeTheme === "system" ? (
            <>
              <div 
                className="absolute inset-0 rounded-full animate-[spin_10s_linear_infinite]"
                style={{
                  background: "conic-gradient(#f14949, #f19d49, #f1f149, #49f149, #49f19d, #49f1f1, #4949f1, #9d49f1, #f149f1, #f14949)",
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
          {THEMES.filter(t => t.id !== "system" && t.id !== "grey").map((theme, index) => {
            const angle = (index * 360) / 9;
            const physicalAngle = angle - 90;
            const radian = physicalAngle * (Math.PI / 180); 
            const radius = 68;
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
                  transform: `translate(${x}px, ${y}px) rotate(${physicalAngle}deg)`,
                  boxShadow: isSelected ? `0 0 15px ${theme.hex}` : `0 0 5px ${theme.hex}`,
                  border: isSelected ? "1px solid white" : "none",
                  clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0 100%)"
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
            ${activeTheme === "grey" 
              ? "bg-[#808080]/20 border-[#808080] text-[#808080] shadow-[0_0_10px_#808080]" 
              : "bg-white/5 border-white/20 text-white/50 hover:text-white hover:border-white/50"
            }`}
        >
          <Activity className="w-3 h-3 shrink-0" />
          Grayscale
        </button>

        <button 
          onClick={() => setActiveTheme("system")}
          className={`flex-1 min-w-[100px] px-3 py-1.5 border text-[9px] font-bold tracking-[0.15em] uppercase transition-all flex justify-center items-center gap-2
            ${activeTheme === "system" 
              ? "bg-system/20 border-system text-system shadow-[0_0_10px_var(--color-system)]" 
              : "bg-white/5 border-white/20 text-white/50 hover:text-white hover:border-white/50"
            }`}
        >
          <Activity className="w-3 h-3 shrink-0" />
          Colorful
        </button>
      </div>
    </div>
  );
}
