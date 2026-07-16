import Link from "next/link";
import MarkdownRenderer from "@/components/MarkdownRenderer";

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
    const res = await fetch(`http://127.0.0.1:8080/api/v1/articles/${slug}`, { 
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

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);

  if (!article) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Không tìm thấy bài viết</h1>
        <Link href="/" className="text-primary underline">Quay lại trang chủ</Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/" className="inline-flex items-center text-primary mb-8 hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
        Quay lại trang chủ
      </Link>

      <article className="glass-card p-8 md:p-12">
        <header className="mb-10 border-b border-white/10 pb-6">
          <div className="flex gap-2 mb-4">
            {article.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            {article.title}
          </h1>
          <p className="text-gray-400 italic text-lg">{article.summary}</p>
        </header>

        {/* Nội dung bài viết với Markdown Renderer */}
        <MarkdownRenderer content={article.content} />
      </article>
    </main>
  );
}
