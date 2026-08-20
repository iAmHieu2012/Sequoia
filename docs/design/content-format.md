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

## 2. Cú pháp nhúng Signal Tuner (Playground)

Trong Markdown, Admin sử dụng cú pháp custom block `{{playground ...}}` để khai báo các module tương tác AI.

```text
{{playground model="yolo-v8-nano" mode="camera" threshold=0.5 title="Bộ giải mã sóng YOLO-Nano"}}
```

**Lý do duy trì từ khóa `playground` trong Markdown:**
Từ khóa "playground" phản ánh đúng nghiệp vụ lõi (môi trường thực hành mô hình). Tên gọi "Signal Tuner" chỉ là lớp hiển thị thuộc về Game Domain ở giao diện người dùng.

**Luồng Client-side Parsing (Web/Android):**
1. Nhận chuỗi Markdown từ Next.js API.
2. Dùng Regex quét các tag `{{playground ...}}`.
3. Gỡ tag ra khỏi Markdown, thay bằng placeholder `<!-- signal-tuner:0 -->`.
4. Render Markdown thành HTML (hoặc Compose Text).
5. Inject component `SignalTuner` vào đúng vị trí placeholder.

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
