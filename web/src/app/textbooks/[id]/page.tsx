import Link from "next/link";
import { ChevronLeft, FileText } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";
import CyberGrid from "@/components/ui/CyberGrid";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface Textbook {
  id: string;
  title: string;
  description: string;
  pdfUrl: string;
  coverImageUrl: string;
  authors: string[];
}

async function getTextbook(id: string): Promise<Textbook | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080'}/api/v1/textbooks`, { 
      cache: "no-store" 
    });
    if (!res.ok) return null;
    const json = await res.json();
    const textbooks: Textbook[] = json.data || [];
    return textbooks.find(t => t.id === id) || null;
  } catch (error) {
    console.error("Error fetching textbook:", error);
    return null;
  }
}

export async function generateStaticParams() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';
  try {
    const res = await fetch(`${baseUrl}/api/v1/textbooks`);
    if (res.ok) {
      const json = await res.json();
      const textbooks: Textbook[] = json.data || [];
      return textbooks.map(t => ({ id: t.id }));
    }
  } catch (e) {
    console.error("Failed to generate static params for textbooks", e);
  }
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const textbook = await getTextbook(id);
  
  if (!textbook) {
    return {
      title: 'Module Not Found | Sequoia',
      description: 'Error 404: Textbook data module could not be located.'
    };
  }

  return {
    title: `${textbook.title} | Sequoia`,
    description: textbook.description,
  };
}

export default async function TextbookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const textbook = await getTextbook(id);

  if (!textbook) {
    notFound();
  }

  return (
    <div className="min-h-screen h-screen w-screen bg-space-bg text-text-main font-sans overflow-hidden scanline-effect relative flex flex-col">
      <CyberGrid />

      {/* Universal Header */}
      <header className="flex-shrink-0 relative z-50 flex items-center justify-between px-6 py-4 border-b border-panel-border bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="inline-flex items-center text-[10px] font-mono tracking-widest uppercase bg-system/5 text-system px-4 py-2 hover:bg-system/20 hover:text-white transition-all duration-300 relative group overflow-hidden">
            <CyberBrackets color="border-system/30 group-hover:border-system transition-colors duration-300" />
            <div className="absolute left-0 top-0 w-1 h-full bg-system scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 ease-out shadow-[0_0_10px_var(--color-system)]" />
            <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-system/10 to-transparent transition-transform duration-700 ease-out pointer-events-none" />
            <span className="relative z-10 flex items-center gap-1 group-hover:drop-shadow-[0_0_8px_var(--color-system)]">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              [ ESC ] ABORT_ACCESS
            </span>
          </Link>

          <div className="flex-col hidden sm:flex">
            <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">ACTIVE_MODULE</span>
            <span className="text-sm font-heading font-bold text-white tracking-widest uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-system" />
              {textbook.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">SYS_STATUS</span>
            <span className="text-xs font-mono text-system tracking-widest uppercase flex items-center gap-2">
              MODULE_ACTIVE
              <span className="w-2 h-2 bg-system shadow-[0_0_8px_var(--color-system)] animate-pulse" />
            </span>
          </div>
        </div>
      </header>

      {/* Datapad Container for PDF Viewer */}
      <main className="flex-1 relative z-10 p-4 md:p-8 flex items-center justify-center overflow-hidden">
        <div className="w-full h-full bg-black/80 border border-system/20 relative shadow-[0_0_30px_color-mix(in_srgb,var(--color-system)_10%,transparent)] backdrop-blur-md flex flex-col transition-all hover:border-system/40 hover:shadow-[0_0_40px_color-mix(in_srgb,var(--color-system)_20%,transparent)]">
          <CyberBrackets color="border-system/40" />
          
          <div className="flex-1 w-full h-full p-1 relative z-10 bg-black/80">
            <iframe 
                src={textbook.pdfUrl} 
                className="w-full h-full border-0 rounded-sm"
                title={textbook.title}
                allowFullScreen
            />
          </div>
        </div>
      </main>
    </div>
  );
}
