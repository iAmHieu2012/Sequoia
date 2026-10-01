import Link from "next/link";
import { FlaskConical, Cpu } from "lucide-react";
import CyberPanel from "@/components/ui/CyberPanel";

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
    <div className="flex flex-col flex-1 min-h-0 bg-space-bg border border-white/10 relative transition-all duration-500 overflow-hidden group/panel">
      <CyberPanel 
        variant="solid-white" 
        chamfer="tl-br" 
        stripes="right"
        padded={false}
        className="flex-shrink-0 flex flex-col justify-between p-4 border-b-4 border-space-bg"
      >
          <div className="flex justify-between items-start relative z-10">
              <span className="text-sm font-bold uppercase tracking-widest font-mono">Lab</span>
              <div className="w-6 h-[2px] bg-space-bg"></div>
          </div>
          <div className="flex justify-between items-end relative z-10 mt-6">
              <div className="flex gap-1">
                 <div className="w-2 h-2 bg-space-bg"></div>
                 <div className="w-2 h-2 bg-space-bg"></div>
                 <div className="w-2 h-2 bg-space-bg"></div>
              </div>
              <div className="text-xs font-bold flex items-center gap-2 font-mono">
                 PLAYGROUND <FlaskConical className="w-4 h-4" />
              </div>
          </div>
      </CyberPanel>
      
      <div className="flex-1 overflow-y-auto min-h-0 uppercase tracking-wider transition-opacity duration-300 opacity-100">
        {loadingModels ? (
            <div className="p-5 text-white/40 animate-pulse text-xs font-mono tracking-widest">SCANNING FOR MODELS...</div>
          ) : models.length === 0 ? (
            <div className="p-5 text-white/40 text-xs font-mono tracking-widest">NO MODELS DETECTED</div>
          ) : (
            models.map(model => (
              <div key={model.id} className="group cursor-pointer border-b border-white/10 bg-space-bg hover:bg-white/10 transition-colors relative overflow-hidden flex flex-col">
                <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-200" />
                
                <div className="relative z-10 w-full flex flex-col h-full">
                  <div className="flex justify-between items-start px-5 pt-5 pb-3">
                    <h3 className="text-sm md:text-base font-mono font-black text-white tracking-widest uppercase pr-4">
                      {model.name}
                    </h3>
                  </div>
                  
                  <div className="px-5 pb-5 flex-1 flex flex-col">
                    <p className="text-white/40 text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-5">
                      &gt; {model.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-mono tracking-widest uppercase text-white/40">
                          TYPE: <span className="text-white font-bold">{model.task_type.replace(/_/g, ' ')}</span>
                        </span>
                        <span className="text-xs text-white/40 font-mono tracking-widest uppercase">
                          v{model.version} {'//'} {model.format}
                        </span>
                      </div>
                      
                      <Link href={`/playground/${model.id}`} className="px-4 py-2 text-xs font-mono font-bold tracking-widest flex items-center gap-2 text-white/40 group-hover:text-space-bg group-hover:bg-white transition-all">
                        INIT <Cpu className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
      </div>
    </div>
  );
}
