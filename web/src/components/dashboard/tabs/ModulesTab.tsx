import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Textbook } from "@/types/dashboard";

interface ModulesTabProps {
  /** List of interactive textbooks (Modules) */
  textbooks: Textbook[];
}

/**
 * Renders the "Modules" tab within the ContentBrowser.
 * Displays a list of interactive textbooks available for the user.
 */
export default function ModulesTab({ textbooks }: ModulesTabProps) {
  if (textbooks.length === 0) {
    return <div className="p-8 text-center text-text-dim font-mono text-xs">NO MODULES ACTIVE.</div>;
  }

  return (
    <>
      {textbooks.map(book => (
        <div key={book.id} className="group cursor-pointer border-b border-panel-border px-5 py-4 hover:bg-orange/5 transition-all duration-300 relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-orange scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-orange)]" />
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-orange/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-heading text-sm font-bold text-white group-hover:text-orange group-hover:drop-shadow-[0_0_8px_var(--color-orange)] transition-all duration-300 tracking-wide uppercase">{book.title}</h3>
            </div>
            <p className="text-text-dim text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-4">
              &gt; {book.description}
            </p>
            <div className="flex justify-between items-center border-t border-panel-border pt-3">
              <span className="text-[10px] text-text-dim font-mono">{book.authors?.join(", ") || "UNKNOWN"}</span>
              <Link href={`/textbooks/${book.id}`} className="text-[10px] font-mono font-bold text-orange tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                ENTER <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
