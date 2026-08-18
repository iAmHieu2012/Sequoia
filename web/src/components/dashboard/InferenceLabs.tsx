import Link from "next/link";
import { FlaskConical, Cpu } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";

/**
 * Representation of an AI Model available in the system.
 */
interface AiModel {
  id: string;
  name: string;
  description: string;
  task_type: string;
  file_url: string;
  version: string;
  format: string;
}

interface InferenceLabsProps {
  /** Array of available AI models */
  models: AiModel[];
  /** Indicates if models are currently being fetched */
  loadingModels: boolean;
}

/**
 * A sidebar panel displaying a list of available AI Inference Models.
 * Provides links to launch each model in the Playground environment.
 */
export default function InferenceLabs({
  models,
  loadingModels
}: InferenceLabsProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-black/40 border border-panel-border relative transition-all duration-500 overflow-hidden group/panel">
      <CyberBrackets color="transition-colors duration-300 border-red/10 group-hover/panel:border-red/50" />

      
      <div className="flex flex-shrink-0 border-b border-panel-border relative z-10">
        <div className="flex-1 flex items-center justify-center gap-2 py-3 px-4 font-heading text-[11px] font-bold tracking-[0.12em] uppercase border-b-2 transition-all duration-300 text-red border-red bg-red/5 drop-shadow-[0_0_8px_var(--color-red)]">
          <FlaskConical className="w-4 h-4 transition-transform duration-500 text-red" />
          <div className="text-left">
            LABS
            <span className="block text-[8px] font-mono font-normal mt-0.5 opacity-50 normal-case tracking-wider">Playground</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-red/20 uppercase tracking-wider transition-opacity duration-300 opacity-100">
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
                    <div className="text-[9px] font-mono bg-red/10 text-red px-1.5 py-0.5 border border-red/20">{model.task_type.replace(/_/g, ' ')}</div>
                  </div>
                  <p className="text-text-dim text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-4">
                    &gt; {model.description}
                  </p>
                  <div className="flex justify-between items-center border-t border-panel-border pt-3">
                    <span className="text-[10px] text-text-dim font-mono">v{model.version} {'//'} {model.format.toUpperCase()}</span>
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
  );
}
