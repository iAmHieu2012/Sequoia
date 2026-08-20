# Master Plan: Chuẩn bị Dự án Sequoia

Tài liệu chuẩn bị dự án dành cho một lập trình viên độc lập, xây dựng hệ thống gồm ứng dụng Android, ứng dụng Web (Next.js full-stack) và tích hợp AI on-device.

---

## Giai đoạn 1: Tài liệu sản phẩm

Nguyên tắc: nội dung ngắn gọn, không đi sâu vào tiểu tiết. Mỗi mục giới hạn trong 1-2 trang.

### Product Requirements Document (PRD) rút gọn

**Tầm nhìn sản phẩm:** Nền tảng học AI/ML có cấu trúc theo giáo trình, kết hợp bài viết chuyên sâu với Model Playground nhúng trực tiếp trong nội dung, cho phép chạy mô hình trên thiết bị người dùng mà không cần server xử lý AI.

**Tính năng bắt buộc cho bản MVP:**

- Hệ thống nội dung linh hoạt với hai cách tổ chức song song:
  - Theo chủ đề độc lập: các bài viết được nhóm theo chủ đề tự do (VD: Computer Vision, NLP, Optimization).
  - Bài viết tự do: không thuộc chủ đề nào, hiển thị dưới dạng "Rogue Anomalies" trên bản đồ.
- Bài viết có playground nhúng bên trong: bài viết không chỉ là văn bản, mà có thể chứa các khối playground tương tác tại vị trí phù hợp trong nội dung, giúp người đọc thực hành ngay khi đang học lý thuyết.
- Render công thức toán học: hỗ trợ LaTeX/KaTeX trong nội dung bài viết.
- Code blocks với syntax highlighting: bài viết AI/ML chứa code Python, cần hiển thị đẹp với syntax highlighting và nút copy.
- Tìm kiếm full-text: tìm kiếm xuyên suốt bài viết, chủ đề. Sử dụng PostgreSQL full-text search hoặc ILIKE cho MVP.
- Model Playground có tính giáo dục: hiển thị confidence score, cho phép điều chỉnh threshold, hiển thị inference time và model size. MVP hỗ trợ mô hình YOLO ở định dạng LiteRT.
- Đăng ký và đăng nhập tài khoản (Supabase Auth).
- Dark mode.

**Tính năng triển khai sau — ưu tiên gần (ảnh hưởng kiến trúc):**

- Admin CMS (Genesis Core): giao diện quản trị riêng để tạo, sửa, xóa bài viết, quản lý chủ đề.
- Bookmark / đánh dấu bài viết: lưu bài để đọc sau.
- Tiến độ đọc: theo dõi đang đọc tới đâu, đánh dấu bài đã hoàn thành.
- Offline support (đặc biệt trên Android): đọc bài viết và chạy model khi không có mạng.

**Tính năng triển khai sau — ưu tiên xa:**

- Glossary / Từ điển thuật ngữ AI/ML.
- Bình luận / Thảo luận dưới bài viết.
- Hỗ trợ thêm nhiều loại mô hình.
- So sánh model trực tiếp.
- Lưu lịch sử các lần chạy mô hình.
- Model Playground cho Gemma.

### Luồng người dùng (The Neural Cosmos Flow)

Luồng duyệt học liệu: Người dùng truy cập ứng dụng và được chào đón bởi **Bản đồ Vũ trụ (Galaxy Map)**.
- Họ chọn một Tinh vân (Nebula) tương ứng với chủ đề muốn học.
- Họ quan sát các Ngôi sao (Celestial Objects - tương ứng với Bài viết).
- Các ngôi sao chưa học sáng bình thường chờ khám phá. Người dùng click vào một Ngôi sao bất kỳ để mở giao diện bài học (Datapad).
- Đọc lý thuyết, cuộn đến phần **Signal Tuner (Playground nhúng)**, chạy thử mô hình.
- Hoàn thành bài học, tín hiệu báo "DECODED", ngôi sao trên bản đồ bùng sáng.

### Lộ trình phát triển

Chia nhỏ theo mốc thời gian cụ thể. Ví dụ:

- Tuần 1-2: cấu hình Supabase, xây dựng Next.js API Routes, thiết lập dự án Android và Web.
- Tuần 3: xây dựng giao diện Web và Android, kết nối với API.
- Tuần 4: tích hợp LiteRT và mô hình YOLO.
- Tuần 5: kiểm thử và triển khai.

---

## Giai đoạn 2: Thiết kế kỹ thuật

Nguyên tắc: chuẩn bị đầy đủ để các thành phần Web, Android và AI tương thích với nhau khi tích hợp.

### Kiến trúc hệ thống

**Phía client:**

- Ứng dụng Web xây dựng bằng Next.js (App Router), tích hợp thư viện LiteRT dành cho web để chạy mô hình AI trực tiếp trên trình duyệt.
- Ứng dụng Android xây dựng bằng Kotlin và Jetpack Compose, tích hợp thư viện LiteRT dành cho Android.

**Phía backend:** Next.js App Router đóng vai trò full-stack — API Routes (`/api/v1/...`) chứa toàn bộ business logic, xác thực, và CRUD. Điều này đảm bảo Web Frontend và API cùng deploy chung, giảm thiểu overhead vận hành.

**Cơ sở dữ liệu và xác thực:** Sử dụng Supabase. PostgreSQL lưu trữ dữ liệu người dùng và bài viết. Supabase Auth xử lý đăng nhập. API Routes sử dụng Supabase Admin Client (`service_role` key) để thao tác database.

**Kiểm soát truy cập dữ liệu:** Next.js API Routes là lớp bảo vệ chính, xử lý toàn bộ logic phân quyền trước khi đọc/ghi PostgreSQL. PostgreSQL RLS (Row Level Security) vẫn được cấu hình như lớp phòng thủ thứ hai (defense-in-depth).

**Lưu trữ tệp:** Sử dụng Public CDN (jsDelivr, Hugging Face) để host các tệp mô hình LiteRT. Cloudinary cho hình ảnh bài viết.

### API Contract

Next.js API Routes tuân theo cấu trúc RESTful. Toàn bộ business logic nằm ở server-side API Routes, Android client chỉ gọi API. Cần định nghĩa rõ các endpoint.

### Thiết kế dữ liệu

Thiết kế các bảng trong PostgreSQL (Supabase), bao gồm:

- Bảng `users`: thông tin người dùng (tự động tạo khi signup qua trigger).
- Bảng `textbooks`: giáo trình với tên, tác giả, mô tả, ảnh bìa.
- Bảng `topics`: chủ đề học tập với article_count tự động tính bởi trigger.
- Bảng `articles` + `article_contents`: metadata và nội dung Markdown tách biệt.
- Bảng `models`: cấu hình mô hình AI.
- Bảng `cosmos_maps`: cấu hình bản đồ sao với cột JSONB `nodes`.
- Bảng `user_progress`: tiến trình học tập.

### Tài liệu README

Khởi tạo ngay khi tạo repository. Nội dung cần bao gồm hướng dẫn cấu hình biến môi trường Supabase, hướng dẫn chạy SQL migration, nội dung RLS policies, hướng dẫn chuyển đổi mô hình YOLO sang định dạng LiteRT, và cách thiết lập môi trường phát triển.

---

## Giai đoạn 3: Tiêu chuẩn code và quy trình làm việc

Nguyên tắc: duy trì kỷ luật trong quy trình làm việc, kể cả khi phát triển một mình.

### Quy ước viết code

- Đối với Android: tuân thủ Kotlin Coding Conventions.
- Đối với Web: sử dụng ESLint (đã cấu hình sẵn với `eslint-config-next`).

### Quy trình Git

- Nhánh main chỉ chứa code ở trạng thái production.
- Nhánh tính năng đặt tên theo cấu trúc `feature/ten-tinh-nang`. Ví dụ: `feature/integrate-yolo-litert`, `feature/blog-api`.
- Thông điệp commit tuân theo chuẩn Conventional Commits.

### Quản lý công việc

Sử dụng GitHub Projects, dạng bảng Kanban, tích hợp trực tiếp với GitHub Issues.

---

## Giai đoạn 4: Môi trường vận hành và bảo mật

Nguyên tắc: tách biệt rõ ràng giữa môi trường phát triển và production.

### Môi trường

Tạo hai project Supabase riêng biệt: một project dùng để phát triển và kiểm thử, một project chỉ sử dụng khi ra mắt chính thức.

### Bảo mật

- `SUPABASE_SERVICE_ROLE_KEY` chỉ được sử dụng phía server (API Routes), không bao giờ lộ ra client.
- Client chỉ giữ `SUPABASE_ANON_KEY` (public key, an toàn để expose).
- File `.env.local` phải được thêm vào `.gitignore` trước lần commit đầu tiên.
- PostgreSQL RLS policies cần được cấu hình như lớp phòng thủ thứ hai.
- Nếu sử dụng GitHub Actions, cấu hình thông tin nhạy cảm thông qua GitHub Secrets.

---

## Checklist khởi động dự án

Hoàn thành các mục sau trước khi bắt đầu viết code:

- [x] Hoàn thành PRD rút gọn, xác định rõ tính năng cốt lõi.
- [x] Xuất thành công một mô hình AI mẫu sang định dạng LiteRT.
- [x] Vẽ sơ đồ kiến trúc hệ thống.
- [x] Viết bản nháp đầu tiên của RLS policies.
- [x] Khởi tạo project Next.js, xác nhận build và chạy local thành công.
- [x] Tạo repository trên GitHub, khởi tạo file README và cấu hình gitignore.
- [ ] Tạo bảng Kanban trên GitHub Projects.
- [x] Tạo hai project Supabase riêng biệt cho môi trường phát triển và production.
