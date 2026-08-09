import React from 'react';
import { Save, X, Sparkles, ChevronLeft, Terminal } from 'lucide-react';
import CyberBrackets from "@/components/ui/CyberBrackets";

export const ForgeLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[10px] font-mono text-white/50 tracking-widest uppercase mb-1">{children}</label>
);

export const ForgeInput = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className="w-full bg-black/60 border border-white/20 p-2 text-sm text-white focus:border-white focus:shadow-[0_0_10px_rgba(255,255,255,0.2)] outline-none font-mono transition-all" 
  />
);

export const ForgeTextarea = ({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea 
    {...props}
    className="w-full bg-black/60 border border-white/20 p-2 text-sm text-white focus:border-white focus:shadow-[0_0_10px_rgba(255,255,255,0.2)] outline-none font-mono resize-none transition-all" 
  />
);

export const ForgeHeader = ({ title, onSave, onClose, children }: { title: string, onSave: () => void, onClose: () => void, children?: React.ReactNode }) => (
  <header className="flex-shrink-0 relative z-50 flex items-center justify-between px-6 py-4 border-b border-white/20 bg-black/80 backdrop-blur-md -mx-6 -mt-6 mb-4">
    <div className="flex items-center gap-6">
      <button onClick={onClose} className="inline-flex items-center text-[10px] font-mono tracking-widest uppercase bg-white/5 text-white px-4 py-2 hover:bg-white/20 hover:text-white transition-all duration-300 relative group overflow-hidden">
        <CyberBrackets color="border-white/30 group-hover:border-white transition-colors duration-300" />
        <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
        <span className="relative z-10 flex items-center gap-1 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          [ ESC ] CANCEL_EDIT
        </span>
      </button>

      <div className="flex-col hidden sm:flex">
        <span className="text-[9px] font-mono text-white/50 tracking-widest uppercase">SYS_FORGE</span>
        <span className="text-sm font-heading font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <Terminal className="w-4 h-4 text-white" />
          {title}
        </span>
      </div>
      
      {children && (
        <div className="flex items-center gap-2 ml-4">
          {children}
        </div>
      )}
    </div>
    
    <div className="flex items-center gap-6">
      <button 
        onClick={onSave} 
        className="group relative px-6 py-2 border border-white/50 hover:border-white transition-colors bg-white/5 flex items-center gap-2 text-xs tracking-widest uppercase overflow-hidden"
      >
        <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        <span className="relative z-10 group-hover:text-black font-bold flex items-center gap-2">
          <Save className="w-4 h-4 group-hover:animate-bounce" /> COMMIT_DATA
        </span>
      </button>
    </div>
  </header>
);

export const ForgeWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col p-6 overflow-hidden animate-in fade-in duration-300">
    <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_50%,#fff_50%)] bg-[length:100%_4px]" />
    <div className="absolute inset-0 pointer-events-none z-0 shadow-[inset_0_0_200px_rgba(255,255,255,0.05)]" />
    {children}
  </div>
);
