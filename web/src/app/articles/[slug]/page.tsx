import Link from "next/link";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { ChevronLeft, TerminalSquare, Lock, AlertTriangle } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  tags: string[];
}

const CyberBrackets = ({ color = "border-decoded/50" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${color}`} />
    <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${color}`} />
    <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${color}`} />
    <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${color}`} />
  </>
);

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080'}/api/v1/articles/${slug}`, { 
      cache: "no-store" 
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return (
      <div className="min-h-screen w-screen bg-[#020205] text-text-main font-sans flex items-center justify-center scanline-effect">
        <div className="bg-anomaly/10 border border-anomaly/30 p-8 max-w-md w-full text-center relative">
          <CyberBrackets color="border-anomaly/50" />
          <AlertTriangle className="w-12 h-12 text-anomaly mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-heading font-bold text-anomaly uppercase mb-2">Signal Lost</h1>
          <p className="font-mono text-xs text-text-dim mb-6">Error 404: Datapad transmission could not be intercepted or has been encrypted by rogue entities.</p>
          <Link href="/" className="inline-flex items-center text-[10px] font-mono tracking-widest uppercase border border-anomaly/50 text-anomaly px-4 py-2 hover:bg-anomaly/20 transition-colors">
            <ChevronLeft className="w-3 h-3 mr-1" /> Abort_Intercept
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#020205] text-text-main font-sans overflow-x-hidden scanline-effect relative">
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-50" style={{
        backgroundImage: 'linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        
        {/* Header/Nav */}
        <div className="flex items-center justify-between mb-8 border-b border-panel-border pb-4">
          <Link href="/" className="inline-flex items-center text-text-dim hover:text-white font-mono text-[11px] tracking-widest uppercase transition-colors group">
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            ABORT_INTERCEPT
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-decoded tracking-widest animate-pulse">DATAPAD_SYNCED</span>
            <TerminalSquare className="w-4 h-4 text-decoded" />
          </div>
        </div>

        {/* Datapad Container */}
        <article className="bg-black/80 border border-decoded/20 relative p-8 md:p-12 shadow-[0_0_50px_rgba(0,229,255,0.05)] backdrop-blur-md">
          <CyberBrackets color="border-decoded/40" />
          
          <header className="mb-10 border-b border-panel-border pb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-decoded/5 border border-decoded/20 text-decoded font-mono text-[10px] tracking-widest uppercase">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-decoding font-mono text-[10px] tracking-widest border border-decoding/30 bg-decoding/10 px-2 py-1 uppercase">
                <Lock className="w-3 h-3" /> CLASSIFIED_DATA
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-heading font-black text-white mb-6 uppercase tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] leading-tight">
              {article.title}
            </h1>
            
            <div className="bg-white/5 border-l-2 border-decoded p-4 font-sans text-sm text-text-dim relative">
              <span className="absolute -top-2 left-2 bg-black px-2 text-[9px] font-mono text-decoded tracking-widest">TRANSMISSION_SUMMARY</span>
              <p className="leading-relaxed mt-1">{article.summary}</p>
            </div>
          </header>

          {/* Nội dung bài viết với Markdown Renderer */}
          <div className="prose prose-invert prose-p:font-sans prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-wide prose-a:text-decoded max-w-none prose-pre:bg-[#05050A] prose-pre:border prose-pre:border-panel-border">
            <MarkdownRenderer content={article.content} />
          </div>

        </article>
      </main>
    </div>
  );
}
