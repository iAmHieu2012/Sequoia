# Quy định định dạng nội dung bài viết — Sequoia (Datapad Format)

> Tài liệu này quy định cách lưu trữ và parse nội dung bài viết trên nền tảng Cosmos. 
> Cập nhật lần cuối: 2026-08-19

---

## 1. Định dạng Markdown Thuần

Dù UI hiển thị dưới dạng **Datapad** (nhật ký không gian), định dạng lưu trữ ở dưới Database (bảng `article_contents`) vẫn là **Markdown chuẩn**.

Việc này đảm bảo tính "sạch sẽ" của dữ liệu giáo dục. Các nền tảng khác nếu muốn tiêu thụ API bài viết vẫn nhận được Markdown thông thường. Việc style thành giao diện viễn tưởng là nhiệm vụ của CSS phía Frontend.

- **LaTeX:** Sử dụng KaTeX (`$...$` và `$$...$$`) để hiển thị công thức toán học.
- **Code block:** Sử dụng Triple backticks. Code được highlight với theme neon/cyberpunk.
- **Hình ảnh:** URL từ Cloudinary.

---

## 2. Playground không nhúng trong bài viết

Bài viết chỉ chứa Markdown thuần, **không** có cú pháp nhúng Playground (không dùng `{{playground ...}}`).

Playground (Signal Tuner) là trang riêng tại `/playground/<model-id>`, người dùng mở từ khung **LAB** trên Dashboard. Nếu bài viết muốn dẫn người đọc sang thực hành, dùng link Markdown thông thường, ví dụ:

```markdown
[Thử model YOLO-Nano trong Lab](/playground/yolo-v8-nano)
```

## 3. Cấu trúc PostgreSQL (Bảng `article_contents`)

Khi lưu vào bảng `article_contents`, nội dung bài viết được lưu dưới dạng Markdown string gốc. Bảng này có quan hệ 1:1 với bảng `articles` thông qua khóa chính `id`, với ràng buộc `ON DELETE CASCADE`.

```sql
-- Cấu trúc bảng
CREATE TABLE public.article_contents (
    id TEXT PRIMARY KEY REFERENCES public.articles(id) ON DELETE CASCADE,
    content TEXT NOT NULL
);
```

Kiến trúc này đảm bảo dữ liệu vừa dễ chỉnh sửa cho Admin (viết thuần text Markdown), vừa tối ưu cho Next.js Backend trong việc validate xem Model ID có tồn tại thực sự hay không.
