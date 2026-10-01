import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { TerminalSquare } from "lucide-react";
import CyberGrid from "@/components/ui/CyberGrid";
import CyberPanel from "@/components/ui/CyberPanel";
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
    <div className="min-h-screen w-screen bg-space-bg text-text-main font-sans relative flex flex-col">
      <CyberGrid />

      {/* Universal Header */}
      <UniversalHeader
        backHref="/dashboard"
        subtitle="ACTIVE_DATAPAD"
        title={article.title}
        titleIcon={<TerminalSquare className="w-4 h-4 text-white/40 shrink-0" />}
        statusLabel="DATAPAD_SYNCED"
        statusActive={true}
      />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 relative z-10 w-full">
        
        {/* Datapad Container */}
        <article className="relative w-full">
          <CyberPanel variant="glass" chamfer="none" decorations="brackets" className="p-8 md:p-12 shadow-[0_0_50px_rgba(255,255,255,0.03)] z-10">
            <header className="mb-10 border-b border-white/10 pb-8">
              <div className="flex flex-wrap gap-4 mb-6">
                {(article.tags || []).map(tag => (
                  <span key={tag} className="font-mono text-xs tracking-widest uppercase text-white/40">
                    #{tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-5xl font-mono font-black text-white mb-6 uppercase tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] leading-tight">
                {article.title}
              </h1>
              
              <div className="bg-white/10 border-l-2 border-white/40 p-4 font-sans text-sm text-white/70 relative mt-6">
                <span className="absolute -top-2 left-2 bg-space-bg px-2 text-xs font-mono text-white/40 tracking-widest uppercase">TRANSMISSION_SUMMARY</span>
                <p className="leading-relaxed mt-1">{article.summary}</p>
              </div>
            </header>

            {/* Nội dung bài viết với Markdown Renderer */}
            <div className="mt-8 w-full relative z-20">
              <MarkdownRenderer content={article.content} />
            </div>

            <div className="mt-12 w-full flex justify-end">
              <ArticleProgressToggle article_id={article.id} />
            </div>
          </CyberPanel>
        </article>
      </main>
    </div>
  );
}
