# Quy định định dạng nội dung bài viết — Sequoia (Datapad Format)

> Tài liệu này quy định cách lưu trữ và parse nội dung bài viết trên nền tảng Cosmos. 
> Cập nhật lần cuối: 2026-07-20

---

## 1. Định dạng Markdown Thuần

Dù UI hiển thị dưới dạng **Datapad** (nhật ký không gian), định dạng lưu trữ ở dưới Database (collection `articles`) vẫn là **Markdown chuẩn**.

Việc này đảm bảo tính "sạch sẽ" của dữ liệu giáo dục. Các nền tảng khác nếu muốn tiêu thụ API bài viết vẫn nhận được Markdown thông thường. Việc style thành giao diện viễn tưởng là nhiệm vụ của CSS (`theme_cosmos.html`) phía Frontend.

- **LaTeX:** Sử dụng KaTeX (`$...$` và `$$...$$`) để hiển thị công thức toán học.
- **Code block:** Sử dụng Triple backticks. Code được highlight với theme neon/cyberpunk bằng Prism.js.
- **Hình ảnh:** URL từ Cloudflare R2.

---

## 2. Cú pháp nhúng Signal Tuner (Playground)

Trong Markdown, Admin sử dụng cú pháp custom block `{{playground ...}}` để khai báo các module tương tác AI.

```text
{{playground model="yolo-v8-nano" mode="camera" threshold=0.5 title="Bộ giải mã sóng YOLO-Nano"}}
```

**Lý do duy trì từ khóa `playground` trong Markdown:**
Từ khóa "playground" phản ánh đúng nghiệp vụ lõi (môi trường thực hành mô hình). Tên gọi "Signal Tuner" chỉ là lớp hiển thị thuộc về Game Domain ở giao diện người dùng.

**Luồng Client-side Parsing (Web/Android):**
1. Nhận chuỗi Markdown từ Ktor API.
2. Dùng Regex quét các tag `{{playground ...}}`.
3. Gỡ tag ra khỏi Markdown, thay bằng placeholder `<!-- signal-tuner:0 -->`.
4. Render Markdown thành HTML (hoặc Compose Text).
5. Inject component `SignalTuner` vào đúng vị trí placeholder.

## 3. Cấu trúc Firestore (Derived Data)

Khi lưu vào collection `articles`, mảng cấu hình `playgroundBlocks` được trích xuất ngầm để lưu chung với document.

```json
{
  "id": "vector-spaces",
  "title": "Vector Spaces",
  "slug": "vector-spaces",
  "content": "# Transmission Received\n\n...",
  "summary": "Brief summary of the transmission",
  "isPublished": true,
  "playgroundBlocks": [
    {
      "modelId": "yolo-v8-nano",
      "position": 1,
      "defaultConfig": {
        "threshold": "0.5"
      }
    }
  ]
}
```

Kiến trúc này đảm bảo dữ liệu vừa dễ chỉnh sửa cho Admin (viết thuần text Markdown), vừa tối ưu cho Ktor Backend trong việc validate xem Model ID có tồn tại thực sự hay không.
