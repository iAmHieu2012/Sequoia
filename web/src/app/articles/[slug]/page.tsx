import Link from "next/link";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { ChevronLeft, TerminalSquare, Lock, AlertTriangle } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";
import CyberGrid from "@/components/ui/CyberGrid";
import ArticleProgressToggle from "@/components/articles/ArticleProgressToggle";
interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  tags: string[];
}

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
      <div className="min-h-screen w-screen bg-space-bg text-text-main font-sans flex items-center justify-center scanline-effect">
        <div className="bg-pink/10 border border-pink/30 p-8 max-w-md w-full text-center relative">
          <CyberBrackets color="border-pink/50" />
          <AlertTriangle className="w-12 h-12 text-pink mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-heading font-bold text-pink uppercase mb-2">Signal Lost</h1>
          <p className="font-mono text-xs text-text-dim mb-6">Error 404: Datapad transmission could not be intercepted or has been encrypted by rogue entities.</p>
          <Link href="/" className="inline-flex items-center text-[10px] font-mono tracking-widest uppercase border border-pink/50 text-pink px-4 py-2 hover:bg-pink/20 transition-colors">
            <ChevronLeft className="w-3 h-3 mr-1" /> Abort_Intercept
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-space-bg text-text-main font-sans overflow-x-hidden scanline-effect relative">
      <CyberGrid />

      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        
        {/* Header/Nav */}
        <div className="flex items-center justify-between mb-8 border-b border-panel-border pb-4">
          <Link href="/" className="inline-flex items-center text-text-dim hover:text-white font-mono text-[11px] tracking-widest uppercase transition-colors group">
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            ABORT_INTERCEPT
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-system tracking-widest animate-pulse">DATAPAD_SYNCED</span>
            <TerminalSquare className="w-4 h-4 text-system" />
          </div>
        </div>

        {/* Datapad Container */}
        <article className="bg-black/80 border border-system/20 relative p-8 md:p-12 shadow-[0_0_50px_color-mix(in_srgb,var(--color-system)_5%,transparent)] backdrop-blur-md">
          <CyberBrackets color="border-system/40" />
          
          <header className="mb-10 border-b border-panel-border pb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-system/5 border border-system/20 text-system font-mono text-[10px] tracking-widest uppercase">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-white font-mono text-[10px] tracking-widest border border-white/30 bg-white/10 px-2 py-1 uppercase">
                <Lock className="w-3 h-3" /> CLASSIFIED_DATA
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-heading font-black text-white mb-6 uppercase tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] leading-tight">
              {article.title}
            </h1>
            
            <div className="bg-white/5 border-l-2 border-system p-4 font-sans text-sm text-text-dim relative">
              <span className="absolute -top-2 left-2 bg-black px-2 text-[9px] font-mono text-system tracking-widest">TRANSMISSION_SUMMARY</span>
              <p className="leading-relaxed mt-1">{article.summary}</p>
            </div>
          </header>

          {/* Nội dung bài viết với Markdown Renderer */}
          <div className="prose prose-invert prose-p:font-sans prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-wide prose-a:text-system max-w-none prose-pre:bg-[#05050A] prose-pre:border prose-pre:border-panel-border">
            <MarkdownRenderer content={article.content} />
          </div>

          <ArticleProgressToggle articleId={article.id} />
        </article>
      </main>
    </div>
  );
}
