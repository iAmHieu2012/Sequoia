import Link from "next/link";

interface Chapter {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
}

async function getChapters(textbookId: string): Promise<Chapter[]> {
  const res = await fetch(`http://127.0.0.1:8080/api/v1/textbooks/${textbookId}/chapters`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

async function getArticles(chapterId: string): Promise<Article[]> {
  const res = await fetch(`http://127.0.0.1:8080/api/v1/chapters/${chapterId}/articles`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function TextbookPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const chapters = await getChapters(resolvedParams.id);

  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <Link href="/" className="inline-flex items-center text-primary mb-8 hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
        Quay lại trang chủ
      </Link>

      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-4">Mục lục giáo trình</h1>
        <p className="text-gray-400 text-lg">Học tập theo lộ trình chuẩn từ cơ bản đến nâng cao.</p>
      </div>

      <div className="space-y-12">
        {chapters.length === 0 ? (
          <div className="glass-card p-8 text-center text-gray-500">Chưa có chương nào được tạo.</div>
        ) : (
          chapters.map(async (chapter) => {
            const articles = await getArticles(chapter.id);
            return (
              <div key={chapter.id} className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-2">
                  <span className="text-gradient">{chapter.title}</span>
                </h2>
                <p className="text-gray-400 mb-6">{chapter.description}</p>
                
                <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                  {articles.length === 0 ? (
                    <p className="text-gray-500 italic">Chưa có bài viết nào.</p>
                  ) : (
                    articles.map(article => (
                      <Link href={`/articles/${article.slug}`} key={article.id} className="block group">
                        <div className="p-4 rounded-xl transition-all hover:bg-primary/5 border border-transparent hover:border-primary/20">
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors mb-1">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-400 line-clamp-1">{article.summary}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
