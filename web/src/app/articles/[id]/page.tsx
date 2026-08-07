import Link from "next/link";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { ChevronLeft, TerminalSquare, Lock } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";
import CyberGrid from "@/components/ui/CyberGrid";
import ArticleProgressToggle from "@/components/articles/ArticleProgressToggle";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cache } from "react";

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
}

const getArticle = cache(async (id: string): Promise<Article | null> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080'}/api/v1/articles/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
});

export async function generateStaticParams() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';
  const ids: { id: string }[] = [];

  try {
    // 1. Fetch standalone articles
    const rogueRes = await fetch(`${baseUrl}/api/v1/articles/standalone`);
    if (rogueRes.ok) {
      const rogueJson = await rogueRes.json();
      const articles = rogueJson.data || [];
      articles.forEach((a: any) => ids.push({ id: a.id }));
    }

    // 2. Fetch all topics and their articles
    const tpRes = await fetch(`${baseUrl}/api/v1/topics`);
    if (tpRes.ok) {
      const tpJson = await tpRes.json();
      const topics = tpJson.data || [];
      for (const topic of topics) {
        const tArtRes = await fetch(`${baseUrl}/api/v1/topics/${topic.id}/articles`);
        if (tArtRes.ok) {
          const tArtJson = await tArtRes.json();
          const articles = tArtJson.data || [];
          articles.forEach((a: any) => ids.push({ id: a.id }));
        }
      }
    }
  } catch (e) {
    console.error("Failed to generate static params", e);
  }

  return ids;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  
  if (!article) {
    return {
      title: 'Signal Lost | Sequoia',
      description: 'Error 404: Datapad transmission could not be intercepted.'
    };
  }

  return {
    title: `${article.title} | Sequoia`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      tags: article.tags,
    }
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen w-screen bg-space-bg text-text-main font-sans overflow-x-hidden scanline-effect relative flex flex-col">
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
              [ ESC ] ABORT_INTERCEPT
            </span>
          </Link>

          <div className="flex-col hidden sm:flex">
            <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">ACTIVE_DATAPAD</span>
            <span className="text-sm font-heading font-bold text-white tracking-widest uppercase flex items-center gap-2">
              <TerminalSquare className="w-4 h-4 text-system" />
              {article.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-text-dim tracking-widest uppercase">SYS_STATUS</span>
            <span className="text-xs font-mono text-system tracking-widest uppercase flex items-center gap-2">
              DATAPAD_SYNCED
              <span className="w-2 h-2 bg-system shadow-[0_0_8px_var(--color-system)]" />
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 relative z-10 w-full">
        
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
          <div className="mt-8 w-full">
            <MarkdownRenderer content={article.content} />
          </div>

          <ArticleProgressToggle articleId={article.id} />
        </article>
      </main>
    </div>
  );
}
