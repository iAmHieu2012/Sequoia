import CyberBrackets from "@/components/ui/CyberBrackets";

interface LogsPanelProps {
  logs: string[];
  booting: boolean;
}

export default function LogsPanel({ logs, booting }: LogsPanelProps) {
  return (
    <div className="flex-1 bg-black/60 border border-panel-border relative flex flex-col min-h-0 p-4">
      <CyberBrackets color="border-system/30" />
      <div className="text-[10px] font-mono text-text-dim tracking-widest uppercase border-b border-panel-border pb-2 mb-3">
        RUNTIME_LOGS
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-[10px] text-system/80 flex flex-col gap-2 leading-relaxed">
        {logs.map((log, i) => (
          <div key={i} className="animate-[fadeIn_0.3s_ease-out]">{log}</div>
        ))}
        {booting && <div className="animate-pulse">_</div>}
      </div>
    </div>
  );
}
