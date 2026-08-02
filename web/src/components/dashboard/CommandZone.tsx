"use client";

import Link from "next/link";
import { FlaskConical, Bot, TerminalSquare, Cpu } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";

interface AiModel {
  id: string;
  name: string;
  description: string;
  taskType: string;
  fileUrl: string;
  version: string;
  format: string;
}

interface CommandZoneProps {
  activeCommandPanel: 'labs' | 'assistant';
  setActiveCommandPanel: (panel: 'labs' | 'assistant') => void;
  models: AiModel[];
  loadingModels: boolean;
}

export default function CommandZone({
  activeCommandPanel,
  setActiveCommandPanel,
  models,
  loadingModels
}: CommandZoneProps) {
  return (
    <div className="flex-shrink-0 w-full lg:w-[350px] flex flex-col gap-4 min-h-0">
      {/* LABS Panel */}
      <div 
        className={`flex flex-col bg-black/40 border border-panel-border relative transition-all duration-500 overflow-hidden group/panel ${activeCommandPanel === 'labs' ? 'flex-1 min-h-0' : 'h-[46px] shrink-0 cursor-pointer hover:bg-red/5 hover:border-red/30'}`}
        onClick={() => { if (activeCommandPanel !== 'labs') setActiveCommandPanel('labs'); }}
      >
        <CyberBrackets color={`transition-colors duration-300 ${activeCommandPanel === 'labs' ? 'border-red/10' : 'border-red/10 group-hover/panel:border-red/50'}`} />
        
        {activeCommandPanel !== 'labs' && (
          <>
            <div className="absolute left-0 top-0 w-1 h-full bg-red scale-y-0 group-hover/panel:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-red)]" />
            <div className="absolute inset-0 -translate-x-[150%] group-hover/panel:translate-x-[150%] bg-gradient-to-r from-transparent via-red/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          </>
        )}
        
        <div className="flex flex-shrink-0 border-b border-panel-border relative z-10">
          <div className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-heading text-[11px] font-bold tracking-[0.12em] uppercase border-b-2 transition-all duration-300 ${activeCommandPanel === 'labs' ? 'text-red border-red bg-red/5 drop-shadow-[0_0_8px_var(--color-red)]' : 'text-text-dim border-transparent group-hover/panel:text-red group-hover/panel:drop-shadow-[0_0_8px_var(--color-red)]'}`}>
            <FlaskConical className={`w-4 h-4 transition-transform duration-500 ${activeCommandPanel === 'labs' ? 'text-red' : 'group-hover/panel:rotate-12'}`} />
            <div className="text-left">
              LABS
              {activeCommandPanel === 'labs' && <span className="block text-[8px] font-mono font-normal mt-0.5 opacity-50 normal-case tracking-wider">Playground</span>}
            </div>
          </div>
        </div>
        
        <div className={`flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-red/20 uppercase tracking-wider transition-opacity duration-300 ${activeCommandPanel === 'labs' ? 'opacity-100' : 'opacity-0'}`}>
          {loadingModels ? (
              <div className="p-4 text-red animate-pulse text-xs font-mono">SCANNING FOR MODELS...</div>
            ) : models.length === 0 ? (
              <div className="p-4 text-text-dim text-xs font-mono">NO MODELS DETECTED</div>
            ) : (
              models.map(model => (
                <div key={model.id} className="group cursor-pointer border-b border-panel-border px-5 py-4 hover:bg-red/5 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1 h-full bg-red scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-red)]" />
                  <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-red/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-heading text-sm font-bold text-red group-hover:text-red group-hover:drop-shadow-[0_0_8px_var(--color-red)] transition-all duration-300 tracking-wide uppercase">{model.name}</h3>
                      <div className="text-[9px] font-mono bg-red/10 text-red px-1.5 py-0.5 border border-red/20">{model.taskType.replace(/_/g, ' ')}</div>
                    </div>
                    <p className="text-text-dim text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-4">
                      &gt; {model.description}
                    </p>
                    <div className="flex justify-between items-center border-t border-panel-border pt-3">
                      <span className="text-[10px] text-text-dim font-mono">v{model.version} // {model.format.toUpperCase()}</span>
                      <Link href={`/playground/${model.id}`} className="text-[10px] font-mono font-bold text-red tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                        INIT_RUNTIME <Cpu className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
        </div>
      </div>

      {/* ASSISTANT Panel */}
      <div 
        className={`flex flex-col bg-black/40 border border-panel-border relative transition-all duration-500 overflow-hidden group/panel ${activeCommandPanel === 'assistant' ? 'flex-1 min-h-0' : 'h-[46px] shrink-0 cursor-pointer hover:bg-system/5 hover:border-system/30'}`}
        onClick={() => { if (activeCommandPanel !== 'assistant') setActiveCommandPanel('assistant'); }}
      >
        <CyberBrackets color={`transition-colors duration-300 ${activeCommandPanel === 'assistant' ? 'border-system/10' : 'border-system/10 group-hover/panel:border-system/50'}`} />
        
        {activeCommandPanel !== 'assistant' && (
          <>
            <div className="absolute left-0 top-0 w-1 h-full bg-system scale-y-0 group-hover/panel:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-system)]" />
            <div className="absolute inset-0 -translate-x-[150%] group-hover/panel:translate-x-[150%] bg-gradient-to-r from-transparent via-system/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          </>
        )}
        
        <div className="flex flex-shrink-0 border-b border-panel-border relative z-10">
          <div className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-left font-heading text-[11px] font-bold tracking-[0.12em] uppercase border-b-2 transition-all duration-300 ${activeCommandPanel === 'assistant' ? 'text-system border-system bg-system/5 drop-shadow-[0_0_8px_var(--color-system)]' : 'text-text-dim border-transparent group-hover/panel:text-system group-hover/panel:drop-shadow-[0_0_8px_var(--color-system)]'}`}>
            <Bot className={`w-4 h-4 transition-all duration-500 ${activeCommandPanel === 'assistant' ? 'animate-pulse text-system' : 'group-hover/panel:scale-110 group-hover/panel:text-system'}`} />
            <div className="text-left">
              ASSISTANT
              {activeCommandPanel === 'assistant' && <span className="block text-[8px] font-mono font-normal mt-0.5 opacity-50 normal-case tracking-wider">AI Uplink</span>}
            </div>
          </div>
        </div>

        <div className={`flex-1 flex flex-col overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/20 transition-opacity duration-300 ${activeCommandPanel === 'assistant' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex-1 flex flex-col p-4">
            {/* Mock Chat UI */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-h-0">
              <div className="group relative overflow-hidden border border-system/30 bg-system/5 p-4 transition-all duration-300">
                <div className="absolute left-0 top-0 w-1 h-full bg-system shadow-[0_0_10px_var(--color-system)]" />
                <div className="relative z-10 text-xs font-mono text-system leading-relaxed">
                  &gt; SYSTEM_AI_ONLINE
                  <br />
                  &gt; Awaiting operator input...
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-panel-border relative shrink-0">
              <input type="text" placeholder="ENTER QUERY..." className="w-full bg-black/50 border border-panel-border text-white text-[10px] tracking-wider font-mono px-3 py-2.5 focus:outline-none focus:border-system transition-colors" />
              <TerminalSquare className="w-3 h-3 absolute right-3 top-[26px] text-text-dim" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
