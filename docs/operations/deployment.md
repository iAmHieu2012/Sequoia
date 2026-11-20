# Hướng dẫn Triển khai (Deployment) Dự án Sequoia

Tài liệu này cung cấp hướng dẫn tổng quan về cách triển khai các thành phần của hệ thống Sequoia.

## 1. Deploy Web App (Next.js Full-stack)

Next.js đóng vai trò cả Frontend lẫn Backend (API Routes), nên chỉ cần deploy một ứng dụng duy nhất.

### Lựa chọn nền tảng

- **Đề xuất:** **Vercel** — tương thích hoàn hảo với Next.js, zero-config, tự động build và deploy từ GitHub.
- *Lựa chọn khác:* Cloudflare Pages, Railway, hoặc self-host với Docker.

### Biến môi trường cần thiết (Environment Variables)

- `NEXT_PUBLIC_SUPABASE_URL`: URL của Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key của Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (chỉ dùng phía server, bypass RLS).
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`: cấu hình Firebase Web App (Project settings > General > Your apps), tương ứng với các trường của `firebaseConfig`.
- `FIREBASE_SERVICE_ACCOUNT`: toàn bộ nội dung file JSON của service account cho `firebase-admin` (Project settings > Service accounts > Generate new private key). Chỉ dùng phía server. Trong `.env.local` viết JSON trên một dòng, bọc trong dấu nháy đơn; trên Vercel dán nguyên nội dung file.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloud name cho Cloudinary image upload.
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: Upload preset cho Cloudinary.

### Build & Deploy

```bash
npm run build    # Build Next.js app
npm run start    # Start production server
```

Trên Vercel: kết nối trực tiếp repository GitHub, mọi push vào `main` sẽ tự động deploy.

## 3. Cấu hình Supabase Production

1. Tạo project mới trên [Supabase Dashboard](https://supabase.com) dành riêng cho Production (tách biệt hoàn toàn với Dev).
2. Chạy file SQL migration `00_init.sql` trên SQL Editor để tạo schema, triggers, và RLS policies.
3. Lưu `SUPABASE_URL`, `SUPABASE_ANON_KEY`, và `SUPABASE_SERVICE_ROLE_KEY` vào biến môi trường của Vercel.

Supabase chỉ làm database; không dùng Supabase Auth.

## 3b. Cấu hình Firebase Authentication

1. Tạo project trên [Firebase Console](https://console.firebase.google.com) và thêm một Web App.
2. **Authentication > Sign-in method:** bật Email/Password và Google.
3. **Authentication > Settings > Authorized domains:** thêm domain production.
4. Đặt lại mật khẩu: mặc định link trong email mở trang đặt mật khẩu của Firebase, đổi xong quay về `/auth`. Muốn dùng trang của Sequoia thì vào **Authentication > Templates > Password reset > Customize action URL**, đặt `https://<domain>/auth/update-password` (không bắt buộc).
5. Lưu các biến `NEXT_PUBLIC_FIREBASE_*` và service account `FIREBASE_*` vào Vercel.
6. Đăng nhập trên site một lần, rồi cấp quyền admin: `npx tsx scripts/make_admin.ts <email>`.

## 4. Host Model Files trên Public CDN

Model files `.tflite` được host miễn phí trên **jsDelivr** (thông qua GitHub Releases) hoặc **Hugging Face Hub**.

1. Upload model file vào GitHub repository hoặc Hugging Face model repo.
2. Lấy public URL và cập nhật vào bảng `models` trên Supabase.
3. Client tải model trực tiếp từ CDN, không cần proxy qua API.

## 5. CI/CD với GitHub Actions

Mẫu luồng công việc (Workflow) tự động hóa:

- **Trigger:** Khi có push/PR vào nhánh `main`.
- **Bước 1 (Lint/Test):** Chạy `npx tsc --noEmit && npm run lint`.
- **Bước 2 (Build):** Build ứng dụng Next.js.
- **Bước 3 (Deploy):** Vercel tự động deploy khi push vào `main` (hoặc dùng Vercel CLI).

> Lưu ý: Cấu hình đầy đủ các biến mật bằng **GitHub Secrets**.

## 6. Checklist Go-Live (Kiểm tra trước khi ra mắt)

1. [ ] Supabase Production project tách biệt hoàn toàn với Dev.
2. [ ] RLS policies đã được apply trên tất cả bảng.
3. [ ] Các biến môi trường nhạy cảm (`SUPABASE_SERVICE_ROLE_KEY`, `FIREBASE_SERVICE_ACCOUNT`) không bị lộ trong repository hoặc client code.
4. [ ] Tất cả triggers (updated_at, article_count, cosmos_map sync, cleanup progress) hoạt động đúng.
5. [ ] Models LiteRT (file .tflite) đã upload lên CDN và cập nhật đường dẫn vào bảng `models`.
7. [ ] Đăng ký, đăng nhập (Email/Google) và đặt lại mật khẩu qua Firebase Auth hoạt động trơn tru.
8. [ ] Ứng dụng Web load trang nhanh, SEO Meta tags đầy đủ.
9. [ ] Đã cấp quyền camera mượt mà trên Web.
11. [ ] Domain chính thức đã được trỏ tới Web App trên Vercel.
12. [ ] Admin đã được cấp claim `admin` bằng `scripts/make_admin.ts`.
13. [ ] Chứng chỉ SSL HTTPS hoạt động (Vercel tự cung cấp).
14. [ ] Seed data đã được chạy trên Production.

## 7. Monitoring (Theo dõi sau triển khai)

- **Vercel Analytics:** Giám sát hiệu năng Web (Core Web Vitals, response time).
- **Sentry:** Tích hợp vào Web để quản lý lỗi/exception runtime.
- **Supabase Dashboard:** Theo dõi database usage và API requests.
- **Firebase Console:** Theo dõi người dùng và lượt đăng nhập.
- **CDN Analytics:** jsDelivr cung cấp thống kê download miễn phí tại jsdelivr.com/statistics.
