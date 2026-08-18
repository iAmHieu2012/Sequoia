import { useEffect, useRef } from "react";
import CyberBrackets from "@/components/ui/CyberBrackets";

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
    <div className="flex-1 bg-black/60 border border-panel-border relative flex flex-col min-h-0 p-4">
      <CyberBrackets color="border-system/30" />
      <div className="text-[10px] font-mono text-text-dim tracking-widest uppercase border-b border-panel-border pb-2 mb-3">
        RUNTIME_LOGS
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-[10px] text-system/80 flex flex-col gap-2 leading-relaxed [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-black/20 [&::-webkit-scrollbar-thumb]:bg-system/30 hover:[&::-webkit-scrollbar-thumb]:bg-system pr-2">
        {logs.map((log, i) => (
          <div key={i} className="animate-[fadeIn_0.3s_ease-out]">{log}</div>
        ))}
        {booting && <div className="animate-pulse">_</div>}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
