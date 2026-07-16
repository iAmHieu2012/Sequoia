import Link from "next/link";

interface Topic {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  articleCount: number;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  tags: string[];
}

async function getTopic(topicId: string): Promise<Topic | null> {
  // In a real API, there might be a GET /api/v1/topics/:id endpoint.
  // For now, we fetch all topics and filter.
  try {
    const res = await fetch(`http://127.0.0.1:8080/api/v1/topics`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.find((t: Topic) => t.id === topicId) || null;
  } catch (e) {
    return null;
  }
}

async function getArticlesByTopic(topicId: string): Promise<Article[]> {
  try {
    const res = await fetch(`http://127.0.0.1:8080/api/v1/topics/${topicId}/articles`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

export default async function TopicDetailPage({ params }: { params: { id: string } }) {
  const [topic, articles] = await Promise.all([
    getTopic(params.id),
    getArticlesByTopic(params.id)
  ]);

  if (!topic) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Không tìm thấy chủ đề</h1>
        <Link href="/topics" className="text-primary underline">Quay lại danh sách</Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <Link href="/topics" className="inline-flex items-center text-primary mb-8 hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
        Tất cả chủ đề
      </Link>

      <div className="mb-12 glass-card p-10 flex items-start gap-6">
        <div className="w-20 h-20 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl">
          {topic.iconUrl || "🧠"}
        </div>
        <div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">{topic.name}</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">{topic.description}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6 border-b border-black/10 dark:border-white/10 pb-4">
          Các bài viết trong chủ đề ({articles.length})
        </h2>

        {articles.length === 0 ? (
          <div className="glass-card p-8 text-center text-gray-500">
            Chưa có bài viết nào thuộc chủ đề này.
          </div>
        ) : (
          <div className="grid gap-4">
            {articles.map((article) => (
              <Link href={`/articles/${article.slug}`} key={article.id} className="block group">
                <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {article.summary}
                    </p>
                  </div>
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap md:justify-end shrink-0">
                      {article.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-black/5 dark:bg-white/5 text-xs font-medium rounded-full text-gray-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
