"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  tags: string[];
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSearch() {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8080/api/v1/articles/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const json = await res.json();
          setResults(json.data || []);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Search failed", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSearch();
  }, [query]);

  return (
    <main className="max-w-4xl mx-auto px-6 py-20">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Kết quả tìm kiếm cho: <span className="text-gradient">"{query}"</span>
        </h1>
        <p className="text-gray-400">Tìm thấy {results.length} bài viết.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-gray-500 text-lg">Không tìm thấy bài viết nào phù hợp với từ khóa của bạn.</p>
          <Link href="/" className="inline-block mt-6 px-6 py-2 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">
            Quay lại trang chủ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((article) => (
            <Link href={`/articles/${article.slug}`} key={article.id} className="block group">
              <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-transparent hover:border-primary/20">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {article.summary}
                  </p>
                </div>
                {article.tags && article.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap shrink-0">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
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
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Đang tải...</div>}>
      <SearchResults />
    </Suspense>
  );
}
