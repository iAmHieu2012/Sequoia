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
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloud name cho Cloudinary image upload.
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: Upload preset cho Cloudinary.

### Build & Deploy

```bash
npm run build    # Build Next.js app
npm run start    # Start production server
```

Trên Vercel: kết nối trực tiếp repository GitHub, mọi push vào `main` sẽ tự động deploy.

## 2. Publish Android App

Luồng đẩy lên Google Play Console:

1. Đảm bảo cấu hình biến môi trường và Base URL API trỏ về server Production.
2. Build ứng dụng thành định dạng `.aab` (Android App Bundle).

   ```bash
   ./gradlew bundleRelease
   ```

3. Ký ứng dụng bằng Keystore (Signing Key Management). Lưu trữ file `.jks` và mật khẩu thật an toàn.
4. Tạo App trên Google Play Console, điền đầy đủ metadata, hình ảnh.
5. Tải `.aab` lên nhánh **Internal Testing** để test nội bộ.
6. Đẩy lên **Production** sau khi đã duyệt thành công.

## 3. Cấu hình Supabase Production

1. Tạo project mới trên [Supabase Dashboard](https://supabase.com) dành riêng cho Production (tách biệt hoàn toàn với Dev).
2. Chạy file SQL migration `00_reset_and_init.sql` trên SQL Editor để tạo schema, triggers, và RLS policies.
3. Kích hoạt **Authentication** (Email/Password & Google Sign-In) trong mục Auth > Providers.
4. Cấu hình `is_admin` custom claim cho tài khoản admin thông qua `app_metadata`.
5. Lưu `SUPABASE_URL`, `SUPABASE_ANON_KEY`, và `SUPABASE_SERVICE_ROLE_KEY` vào biến môi trường của Vercel.

## 4. Host Model Files trên Public CDN

Model files `.tflite` được host miễn phí trên **jsDelivr** (thông qua GitHub Releases) hoặc **Hugging Face Hub**.

1. Upload model file vào GitHub repository hoặc Hugging Face model repo.
2. Lấy public URL và cập nhật vào bảng `models` trên Supabase.
3. Client (Web/Android) tải model trực tiếp từ CDN, không cần proxy qua API.

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
3. [ ] Các biến môi trường nhạy cảm (`SUPABASE_SERVICE_ROLE_KEY`) không bị lộ trong repository hoặc client code.
4. [ ] Tất cả triggers (updated_at, article_count, cosmos_map sync, cleanup progress) hoạt động đúng.
5. [ ] Models LiteRT (file .tflite) đã upload lên CDN và cập nhật đường dẫn vào bảng `models`.
7. [ ] Tính năng đăng ký/đăng nhập qua Supabase Auth hoạt động trơn tru.
8. [ ] Ứng dụng Web load trang nhanh, SEO Meta tags đầy đủ.
9. [ ] Ứng dụng Android chạy không bị crash, giao diện responsive.
10. [ ] Đã cấp quyền camera mượt mà trên cả Web và Android.
11. [ ] Domain chính thức đã được trỏ tới Web App trên Vercel.
12. [ ] Admin đã được set `is_admin: true` trong `app_metadata` trên Supabase Auth.
13. [ ] Chứng chỉ SSL HTTPS hoạt động (Vercel tự cung cấp).
14. [ ] Seed data đã được chạy trên Production.

## 7. Monitoring (Theo dõi sau triển khai)

- **Vercel Analytics:** Giám sát hiệu năng Web (Core Web Vitals, response time).
- **Sentry:** Tích hợp vào Web để quản lý lỗi/exception runtime.
- **Supabase Dashboard:** Theo dõi database usage, auth sessions, và API requests.
- **CDN Analytics:** jsDelivr cung cấp thống kê download miễn phí tại jsdelivr.com/statistics.
