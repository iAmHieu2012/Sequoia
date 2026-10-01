import { useEffect, useRef } from "react";
import CyberPanel from "@/components/ui/CyberPanel";

interface LogsPanelProps {
  /** Array of log strings emitted by the Web Worker/Inference Engine */
  logs: string[];
  /** True if the inference engine is currently booting up */
  booting: boolean;
}

/**
 * A cyberpunk-themed terminal panel that displays live execution logs 
 * from the AI Inference Engine. Automatically scrolls to the newest log entry.
 */
export default function LogsPanel({ logs, booting }: LogsPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, booting]);

  return (
    <CyberPanel variant="outline" chamfer="tl-br" decorations="brackets" className="flex-1 bg-transparent border-white/10 relative flex flex-col min-h-0 p-4">
      <div className="text-xs font-mono text-white/40 tracking-widest uppercase border-b border-white/10 pb-2 mb-3">
        RUNTIME_LOGS
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-xs text-white/70 flex flex-col gap-2 leading-relaxed pr-2">
        {logs.map((log, i) => (
          <div key={i} className="animate-[fadeIn_0.3s_ease-out]">{log}</div>
        ))}
        {booting && <div className="animate-pulse">_</div>}
        <div ref={bottomRef} />
      </div>
    </CyberPanel>
  );
}
