import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-black/10 dark:border-white/10 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <Link href="/" className="text-xl font-bold font-logo flex items-center gap-1">
            <span className="text-gradient">Sequoia</span>
            <span className="text-primary">.</span>
          </Link>
          <p className="text-sm text-gray-500 mt-2">
            Nền tảng học AI/ML tương tác trực tiếp trên trình duyệt.
          </p>
        </div>
        
        <div className="flex gap-6 text-sm text-gray-500">
          <Link href="/about" className="hover:text-primary transition-colors">Về chúng tôi</Link>
          <a href="https://github.com/iamhieu2012/Sequoia" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Github</a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-4 border-t border-black/5 dark:border-white/5 text-center text-xs text-gray-600 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Sequoia. Nền tảng Open-Source Education.
      </div>
    </footer>
  );
}
