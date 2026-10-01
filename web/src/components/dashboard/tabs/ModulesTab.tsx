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
    return <div className="p-5 text-white/40 font-mono text-xs tracking-widest">NO MODULES ACTIVE.</div>;
  }

  return (
    <div className="animate-snap-in">
      {textbooks.map(book => (
        <div key={book.id} className="group cursor-pointer border-b border-white/10 bg-space-bg hover:bg-white/10 transition-colors relative overflow-hidden flex flex-col">
          <div className="absolute left-0 top-0 w-1 h-full bg-white scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-200" />
          
          <div className="relative z-10 w-full flex flex-col h-full">
            <div className="flex justify-between items-start px-5 pt-5 pb-3">
              <h3 className="text-sm md:text-base font-mono font-black text-white tracking-widest uppercase pr-4">
                {book.title}
              </h3>
            </div>
            
            <div className="px-5 pb-5 flex-1 flex flex-col">
              <p className="text-white/40 text-xs font-mono leading-relaxed normal-case line-clamp-2 mb-5">
                &gt; {book.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-2">
                <div className="text-xs font-mono tracking-widest uppercase flex gap-2 items-center">
                  <span className="text-white/40">AUTHOR:</span>
                  <span className="text-white font-bold">
                    {book.authors?.join(", ") || "UNKNOWN"}
                  </span>
                </div>
                
                <Link href={`/textbooks/${book.id}`} className="px-4 py-2 text-xs font-mono font-bold tracking-widest flex items-center gap-2 text-white/40 group-hover:text-space-bg group-hover:bg-white transition-all">
                  ENTER <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
