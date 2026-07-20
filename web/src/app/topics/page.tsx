import Link from "next/link";

interface Topic {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  articleCount: number;
}

async function getTopics(): Promise<Topic[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080'}/api/v1/topics`, { 
      cache: "no-store" 
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error fetching topics:", error);
    return [];
  }
}

export default async function TopicsPage() {
  const topics = await getTopics();

  return (
    <main className="max-w-6xl mx-auto px-6 py-20">
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-4">Khám phá chủ đề</h1>
        <p className="text-gray-400 text-lg">Tìm kiếm các bài viết chuyên sâu theo từng lĩnh vực AI/ML.</p>
      </div>

      {topics.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-400">
          <p>Chưa có chủ đề nào được tạo. Hãy khởi động Ktor Backend server để tải dữ liệu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topics.map((topic) => (
            <Link href={`/topics/${topic.id}`} key={topic.id} className="group outline-none">
              <div className="glass-card h-full p-8 flex flex-col relative overflow-hidden text-center items-center justify-center min-h-[250px]">
                {/* Decorative glow inside card */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500"></div>
                
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {topic.iconUrl || "🧠"}
                </div>
                
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {topic.name}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-6">
                  {topic.description}
                </p>

                <div className="mt-auto px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 text-xs font-medium text-gray-500 group-hover:text-primary transition-colors">
                  {topic.articleCount} Bài viết
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
