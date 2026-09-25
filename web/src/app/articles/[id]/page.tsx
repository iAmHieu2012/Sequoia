import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { TerminalSquare, Lock } from "lucide-react";
import CyberBrackets from "@/components/ui/CyberBrackets";
import CyberGrid from "@/components/ui/CyberGrid";
import UniversalHeader from "@/components/ui/UniversalHeader";
import ArticleProgressToggle from "@/components/articles/ArticleProgressToggle";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cache } from "react";

import { Article as GlobalArticle } from "@/types/dashboard";
import { supabaseAdmin } from "@/utils/supabase/admin";

/**
 * Extended Article type for the detail view, including the full Markdown content.
 */
interface Article extends GlobalArticle {
  content: string;
}

/**
 * Cached function to fetch a specific article and its content from Supabase.
 * Uses React cache to prevent duplicate database calls during a single request lifecycle.
 */
const getArticle = cache(async (id: string): Promise<Article | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*, article_contents(content)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    
    return {
      ...data,
      content: Array.isArray(data.article_contents) 
        ? data.article_contents[0]?.content || ''
        : data.article_contents?.content || ''
    } as Article;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
});

export async function generateStaticParams() {
  const ids: { id: string }[] = [];

  try {
    const { data } = await supabaseAdmin.from('articles').select('id');
    if (data) {
      data.forEach(a => ids.push({ id: a.id }));
    }
  } catch (error) {
    console.error("Failed to generate static params", error);
  }

  return ids;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  
  if (!article) {
    return {
      title: 'Signal Lost',
      description: 'Error 404: Datapad transmission could not be intercepted.'
    };
  }

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      tags: article.tags,
    }
  };
}

/**
 * The Article Detail Page (Server Component).
 * Fetches and renders a specific article's content in Markdown format.
 * Includes tracking logic for completion status.
 */
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
      <UniversalHeader
        backHref="/dashboard"
        backLabel="ABORT_INTERCEPT"
        subtitle="ACTIVE_DATAPAD"
        title={article.title}
        titleIcon={<TerminalSquare className="w-4 h-4 text-system shrink-0" />}
        statusLabel="DATAPAD_SYNCED"
        statusActive={true}
      />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 relative z-10 w-full">
        
        {/* Datapad Container */}
        <article className="bg-black/80 border border-system/20 relative p-8 md:p-12 shadow-[0_0_50px_color-mix(in_srgb,var(--color-system)_5%,transparent)] backdrop-blur-md">
          <CyberBrackets color="border-system/40" />
          
          <header className="mb-10 border-b border-panel-border pb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-wrap gap-2">
                {(article.tags || []).map(tag => (
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

          <ArticleProgressToggle article_id={article.id} />
        </article>
      </main>
    </div>
  );
}
