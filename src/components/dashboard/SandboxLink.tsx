import Link from "next/link";
import { Terminal } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";

/** Dashboard button that opens the Python Sandbox page. */
export default function SandboxLink() {
  return (
    <Link
      href="/sandbox"
      className="flex items-center justify-center h-[46px] shrink-0 bg-black/40 border border-white/10 relative transition-all duration-500 overflow-hidden group/panel cursor-pointer hover:bg-white/10 hover:border-white/40"
    >
      <CyberBrackets color="transition-colors duration-300 border-white/10 group-hover/panel:border-white/40" />
      <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover/panel:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
      <div className="absolute inset-0 -translate-x-[150%] group-hover/panel:translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
      <div className="flex items-center justify-center gap-2 py-2 px-4 font-mono text-xs font-bold tracking-[0.12em] uppercase text-white/40 group-hover/panel:text-white group-hover/panel:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300 relative z-10">
        <Terminal className="w-5 h-5 transition-all duration-500 group-hover/panel:scale-110 opacity-70 group-hover/panel:opacity-100" />
        <span>PYTHON SANDBOX</span>
      </div>
    </Link>
  );
}
