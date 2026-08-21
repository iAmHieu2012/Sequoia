import Link from "next/link";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";
import CyberGrid from "@/components/ui/CyberGrid";

export default function NotFound() {
  return (
    <div className="min-h-screen w-screen bg-space-bg text-text-main font-sans flex flex-col items-center justify-center scanline-effect relative overflow-hidden">
      <CyberGrid opacity="opacity-20" />
      
      <div className="bg-coral/10 border border-coral/30 p-8 max-w-md w-full text-center relative z-10 backdrop-blur-sm shadow-[0_0_50px_rgba(255,80,80,0.1)]">
        <CyberBrackets color="border-coral/50" />
        <AlertTriangle className="w-12 h-12 text-coral mx-auto mb-4 animate-pulse drop-shadow-[0_0_10px_var(--color-coral)]" />
        <h1 className="text-3xl font-heading font-black text-white uppercase mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Signal Lost</h1>
        <p className="font-mono text-xs text-coral/80 mb-8 leading-relaxed">
          Error 404: Datapad transmission could not be intercepted or has been encrypted by rogue entities.
        </p>
        
        <Link href="/dashboard" className="inline-flex items-center text-[10px] font-mono tracking-widest uppercase border border-coral/50 text-coral px-6 py-3 hover:bg-coral/20 hover:text-white transition-all duration-300 relative group overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-coral scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-coral)]" />
          <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] bg-linear-to-r from-transparent via-coral/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          <span className="relative z-10 flex items-center gap-2 group-hover:drop-shadow-[0_0_8px_var(--color-coral)]">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Abort_Intercept
          </span>
        </Link>
      </div>
    </div>
  );
}
