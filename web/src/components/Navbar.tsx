"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-black/10 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold font-logo flex items-center gap-1">
          <span className="text-gradient">Sequoia</span>
          <span className="text-primary">.</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Giáo trình
          </Link>
          <Link href="/topics" className="text-sm font-medium hover:text-primary transition-colors">
            Chủ đề
          </Link>
          <form onSubmit={handleSearch} className="relative group">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết..." 
              className="pl-10 pr-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/50 focus:bg-transparent outline-none text-sm w-48 focus:w-64 transition-all duration-300"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          </form>
          {/* ThemeToggle is placed globally in layout, but we could put it in the nav */}
        </div>
      </div>
    </nav>
  );
}
