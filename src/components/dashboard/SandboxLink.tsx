import Link from "next/link";
import { Terminal, ArrowRight } from "lucide-react";

/**
 * Dashboard card that opens the Python Sandbox page.
 * Styled like a tool entry in the Lab list (icon, name, OPEN action), so it reads as a tool
 * to launch and not as another collapsible bar like the AI Assistant.
 */
export default function SandboxLink() {
  return (
    <Link
      href="/sandbox"
      className="group relative shrink-0 flex items-center gap-4 px-5 py-4 bg-space-bg border border-white/10 hover:bg-white/10 hover:border-white/40 transition-colors overflow-hidden"
    >
      <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-200" />

      <div className="relative z-10 w-10 h-10 shrink-0 border border-white/20 group-hover:border-white flex items-center justify-center transition-colors">
        <Terminal className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
      </div>

      <div className="relative z-10 flex-1 min-w-0">
        <div className="text-sm font-mono font-black text-white tracking-widest uppercase truncate">Python Sandbox</div>
        <div className="text-xs font-mono text-white/40 truncate">&gt; Run Python in your browser</div>
      </div>

      <span className="relative z-10 shrink-0 px-4 py-2 text-xs font-mono font-bold tracking-widest flex items-center gap-2 text-white/40 group-hover:text-space-bg group-hover:bg-white transition-all">
        OPEN <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </span>
    </Link>
  );
}
