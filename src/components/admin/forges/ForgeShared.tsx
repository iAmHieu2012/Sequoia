import React from 'react';
import { Save, ChevronLeft, Terminal } from 'lucide-react';
import CyberButton from "@/components/ui/CyberButton";

export const ForgeLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-mono text-white/40 tracking-widest uppercase mb-1">{children}</label>
);

export const ForgeInput = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className={`w-full bg-black/70 border border-white/40 p-2 text-sm text-white focus:border-white focus:shadow-[0_0_10px_rgba(255,255,255,0.2)] outline-none font-mono transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`} 
  />
);

export const ForgeTextarea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea 
    {...props}
    className={`w-full bg-black/70 border border-white/40 p-2 text-sm text-white focus:border-white focus:shadow-[0_0_10px_rgba(255,255,255,0.2)] outline-none font-mono resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`} 
  />
);

export const ForgeHeader = ({ title, onSave, onClose, children }: { title: string, onSave: () => void, onClose: () => void, children?: React.ReactNode }) => (
  <header className="flex-shrink-0 relative z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/70 backdrop-blur-md -mx-6 -mt-6 mb-4">
    <div className="flex items-center gap-2 lg:gap-6">
      <CyberButton onClick={onClose} variant="secondary" className="w-auto h-auto py-2">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="hidden lg:inline">[ ESC ] CANCEL_EDIT</span>
        <span className="lg:hidden">ESC</span>
      </CyberButton>

      <div className="flex-col hidden lg:flex">
        <span className="text-xs font-mono text-white/40 tracking-widest uppercase">SYS_FORGE</span>
        <span className="text-sm font-mono font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <Terminal className="w-4 h-4 text-white" />
          {title}
        </span>
      </div>
      
      {children && (
        <div className="flex items-center gap-2 ml-2 lg:ml-4">
          {children}
        </div>
      )}
    </div>
    
    <div className="flex items-center gap-2 lg:gap-6">
      <CyberButton onClick={onSave} variant="primary" className="w-auto h-auto py-2 group">
        <Save className="w-4 h-4 group-hover:animate-bounce" /> 
        <span className="hidden lg:inline">COMMIT_DATA</span>
      </CyberButton>
    </div>
  </header>
);

export const ForgeWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black/100 z-[100] flex flex-col p-6 overflow-hidden animate-in fade-in duration-300">
    <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03]" />
    <div className="absolute inset-0 pointer-events-none z-0 shadow-[inset_0_0_200px_rgba(255,255,255,0.05)]" />
    {children}
  </div>
);
