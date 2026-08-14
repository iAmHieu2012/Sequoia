import { ChevronLeft, Cpu } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";
import { AiModel } from "@/types/playground";

interface ModelInfoBarProps {
  model: AiModel;
  booting: boolean;
  handleEscape: () => void;
}

export default function ModelInfoBar({ model, booting, handleEscape }: ModelInfoBarProps) {
  return (
    <header className="flex-shrink-0 relative z-10 flex items-center justify-between px-6 py-4 border-b border-panel-border bg-black/80 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <button 
          onClick={handleEscape}
          className="inline-flex items-center text-[10px] font-mono tracking-widest uppercase bg-system/5 text-system px-4 py-2 hover:bg-system/20 hover:text-white transition-all duration-300 relative group overflow-hidden"
        >
          <CyberBrackets color="border-system/30 group-hover:border-system transition-colors duration-300" />
          <div className="absolute left-0 top-0 w-1 h-full bg-system scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-system)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-system/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          <span className="relative z-10 flex items-center gap-1 group-hover:drop-shadow-[0_0_8px_var(--color-system)]">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            [ ESC ] ABORT_RUNTIME
          </span>
        </button>
        
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">ACTIVE_MODEL</span>
          <span className="text-sm font-heading font-bold text-white tracking-widest uppercase flex items-center gap-2">
            <Cpu className="w-4 h-4 text-system" />
            {model.name}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">TASK_TYPE</span>
          <span className="text-xs font-mono text-system tracking-widest uppercase bg-system/10 px-2 py-0.5 border border-system/20">
            {model.task_type.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="w-[1px] h-8 bg-panel-border" />
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">SYS_STATUS</span>
          <span className="text-xs font-mono text-system tracking-widest uppercase flex items-center gap-2">
            {booting ? 'INITIALIZING' : 'ONLINE'}
            <span className={`w-2 h-2 ${booting ? 'bg-coral animate-pulse' : 'bg-system shadow-[0_0_8px_var(--color-system)]'}`} />
          </span>
        </div>
      </div>
    </header>
  );
}
