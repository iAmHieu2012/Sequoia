import Link from "next/link";

interface Textbook {
  id: string;
  title: string;
  description: string;
  authors: string[];
  sortOrder: number;
}

async function getTextbooks(): Promise<Textbook[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080'}/api/v1/textbooks`, { 
      cache: "no-store" 
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error fetching textbooks:", error);
    return [];
  }
}

export default async function Home() {
  const textbooks = await getTextbooks();

  return (
    <main className="max-w-6xl mx-auto px-6 py-20">
      {/* Header Section */}
      <div className="text-center mb-20">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Làm chủ AI cùng <span className="text-gradient">Interactive Playgrounds</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Nền tảng học Machine Learning bài bản nhất. 
          Đọc lý thuyết chuyên sâu và chạy thử mô hình AI trực tiếp ngay trên trình duyệt.
        </p>
      </div>

      {/* Course Grid */}
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          Featured Textbooks
        </h2>
      </div>

      {textbooks.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-400">
          <p>No textbooks found. Please start the Ktor Backend server to load data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {textbooks.map((book) => (
            <Link href={`/textbooks/${book.id}`} key={book.id} className="group outline-none">
              <div className="glass-card h-full p-8 flex flex-col relative overflow-hidden">
                {/* Decorative glow inside card */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500"></div>
                
                <div className="mb-6 flex-grow z-10">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {book.description}
                  </p>
                </div>
                
                <div className="mt-auto pt-6 border-t border-white/10 z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white shadow-inner">
                      {book.authors[0]?.charAt(0) || "A"}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {book.authors.join(", ")}
                    </span>
                  </div>
                  <div className="text-primary bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 group-hover:text-primary transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
