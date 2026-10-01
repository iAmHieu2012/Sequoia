import { FileText, AlertTriangle } from "lucide-react";
import CyberPanel from "@/components/ui/CyberPanel";
import CyberGrid from "@/components/ui/CyberGrid";
import UniversalHeader from "@/components/ui/UniversalHeader";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cache } from "react";

import { Textbook } from "@/types/dashboard";
import { supabaseAdmin } from "@/utils/supabase/admin";

/**
 * Cached function to fetch a specific textbook from Supabase.
 * Uses React cache to prevent duplicate database calls during a single request lifecycle.
 */
const getTextbook = cache(async (id: string): Promise<Textbook | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('textbooks')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      pdf_url: data.pdf_url,
      cover_image_url: data.cover_image_url,
      authors: data.authors
    } as Textbook;
  } catch (error) {
    console.error("Error fetching textbook:", error);
    return null;
  }
});

export async function generateStaticParams() {
  try {
    const { data } = await supabaseAdmin.from('textbooks').select('id');
    if (data) {
      return data.map(t => ({ id: t.id }));
    }
  } catch (error) {
    console.error("Failed to generate static params for textbooks", error);
  }
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const textbook = await getTextbook(id);
  
  if (!textbook) {
    return {
      title: 'Module Not Found',
      description: 'Error 404: Textbook data module could not be located.'
    };
  }

  return {
    title: textbook.title,
    description: textbook.description,
    openGraph: {
      title: textbook.title,
      description: textbook.description,
      type: 'website',
    }
  };
}

/**
 * The Textbook Detail Page (Server Component).
 * Fetches and renders a specific textbook's PDF content within an iframe.
 */
export default async function TextbookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const textbook = await getTextbook(id);

  if (!textbook) {
    notFound();
  }

  return (
    <div className="min-h-screen h-screen w-screen bg-space-bg text-text-main font-sans overflow-hidden relative flex flex-col">
      <CyberGrid />

      {/* Universal Header */}
      <UniversalHeader
        backHref="/dashboard"
        subtitle="ACTIVE_MODULE"
        title={textbook.title}
        titleIcon={<FileText className="w-4 h-4 text-white/40 shrink-0" />}
        statusLabel="MODULE_ACTIVE"
        statusActive={true}
      />

      {/* Datapad Container for PDF Viewer */}
      <main className="flex-1 relative z-10 p-4 md:p-8 flex items-center justify-center overflow-hidden">
        <CyberPanel variant="glass" chamfer="none" decorations="brackets" className="w-full h-full flex flex-col z-10 shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all hover:border-white/40 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
          <div className="flex-1 w-full h-full p-1 relative z-10 flex items-center justify-center">
            {textbook.pdf_url ? (
              <iframe 
                src={textbook.pdf_url} 
                className="w-full h-full border-0"
                title={textbook.title}
                allowFullScreen
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-coral gap-4 p-8 bg-coral/5 border border-coral/20">
                <AlertTriangle className="w-12 h-12 animate-pulse" />
                <div className="text-center">
                  <h3 className="font-mono text-lg font-bold uppercase tracking-widest mb-2">PDF_PAYLOAD_MISSING</h3>
                  <p className="font-mono text-xs text-coral/80 uppercase">No datastream attached to this module. Awaiting transmission.</p>
                </div>
              </div>
            )}
          </div>
        </CyberPanel>
      </main>
    </div>
  );
}
