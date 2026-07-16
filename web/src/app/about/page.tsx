import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Về <span className="text-gradient font-logo">Sequoia.</span>
        </h1>
        <p className="text-xl text-gray-400">
          Nền tảng học AI/ML tương tác trực tiếp, sinh ra để phá vỡ mọi rào cản học thuật.
        </p>
      </div>

      <div className="space-y-12">
        <section className="glass-card p-10">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Tầm nhìn sản phẩm</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Hầu hết các tài liệu Machine Learning hiện tại hoặc quá nặng về lý thuyết hàn lâm, hoặc chỉ là những đoạn code Python chạy trên Google Colab mà người học không thực sự cảm nhận được nó hoạt động như thế nào. 
          </p>
          <p className="text-gray-400 leading-relaxed">
            <strong className="text-primary">Sequoia</strong> được tạo ra để giải quyết vấn đề đó. Chúng tôi mang đến một nền tảng học AI/ML có cấu trúc như một cuốn giáo trình chuẩn, kết hợp với các bài viết chuyên sâu và <strong className="text-primary">Model Playground</strong> nhúng trực tiếp ngay trong nội dung.
          </p>
        </section>

        <section className="glass-card p-10 text-center">
          <h2 className="text-2xl font-bold mb-4">Tham gia cùng chúng tôi</h2>
          <p className="text-gray-400 mb-8">
            Dự án hoàn toàn mã nguồn mở. Mọi đóng góp, báo cáo lỗi hay đề xuất tính năng đều được chào đón nồng nhiệt trên Github.
          </p>
          <a 
            href="https://github.com/iamhieu2012/Sequoia" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-full hover:scale-105 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
            Star on Github
          </a>
        </section>
      </div>
    </main>
  );
}
