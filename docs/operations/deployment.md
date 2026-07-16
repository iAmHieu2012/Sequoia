# Hướng dẫn Triển khai (Deployment) Dự án Sequoia

Tài liệu này cung cấp hướng dẫn tổng quan về cách triển khai các thành phần của hệ thống Sequoia.

## 1. Deploy Ktor Backend

### Lựa chọn nền tảng

- **Đề xuất cho Solo Dev:** **Railway** hoặc **Render**. Miễn phí/Rẻ, setup nhanh gọn qua GitHub, tự động build Docker.
- *Lựa chọn khác:* Cloud Run (linh hoạt, scale tốt, tính tiền theo request nhưng setup phức tạp hơn), VPS (cần tự quản lý Docker, Nginx).

### Dockerfile mẫu cho Ktor

```dockerfile
# Build stage
FROM gradle:8.3-jdk17 AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle buildFatJar --no-daemon

# Run stage
FROM openjdk:17-jdk-slim
EXPOSE 8080
RUN mkdir /app
COPY --from=build /home/gradle/src/build/libs/*.jar /app/ktor-backend.jar
ENTRYPOINT ["java","-jar","/app/ktor-backend.jar"]
```

### Biến môi trường cần thiết (Environment Variables)

- `FIREBASE_PROJECT_ID`: ID dự án Firebase
- `FIREBASE_CLIENT_EMAIL`: Email của Service Account
- `FIREBASE_PRIVATE_KEY`: Private Key của Service Account (chứa quyền Admin)
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`: Thông tin xác thực Cloudflare R2 để tạo presigned URL.

## 2. Deploy Web App

- **Nền tảng:** Đề xuất **Vercel** (vì tương thích hoàn hảo nếu dùng Next.js) hoặc **Cloudflare Pages** (nhanh, rẻ).
- **Cách deploy:** Kết nối trực tiếp repository trên GitHub.
- **Build Command:** `npm run build` hoặc `yarn build`
- **Output Directory:** `out` (đối với Next.js static export) hoặc `.next`.
- **Environment Variables:**
  - `NEXT_PUBLIC_API_BASE_URL`: URL của backend Ktor.
  - `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, v.v... (Cấu hình public của Firebase).

## 3. Publish Android App

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

## 4. Cấu hình Firebase Production

1. Tạo dự án mới trên Firebase Console dành riêng cho Production (tách biệt hoàn toàn với Dev).
2. Kích hoạt **Authentication** (Email/Password & Google Sign-In).
3. Kích hoạt **Firestore Database**.
4. Cập nhật và triển khai **Firestore Security Rules** theo file `security-rules.md`.
5. Tạo **Service Account**, tải file JSON key về và thiết lập vào biến môi trường cho Ktor Backend.

## 5. Cấu hình Cloudflare R2

1. Tạo **Bucket mới** trên Cloudflare Dashboard.
2. Cấu hình **Public Access** (Public Bucket URL) để Web/Android tải mô hình và ảnh không cần authentication.
3. Thiết lập **CORS rules** để Web App (cùng domain) có thể lấy file mà không bị trình duyệt chặn.
4. Tạo **R2 API Token** với quyền Write để Ktor tạo presigned URL cho luồng upload. Cài thông tin token vào Ktor.

## 6. CI/CD với GitHub Actions

Mẫu luồng công việc (Workflow) tự động hóa:

- **Trigger:** Khi có push/PR vào nhánh `main`.
- **Bước 1 (Lint/Test):** Chạy code formatter, tĩnh, unit test cho cả Backend và Web.
- **Bước 2 (Build Web):** Build ứng dụng Web.
- **Bước 3 (Build Backend):** Build file JAR của Ktor.
- **Bước 4 (Deploy Web):** Push lên Vercel/Cloudflare.
- **Bước 5 (Deploy Backend):** Kích hoạt webhook hoặc push image Docker lên nền tảng host (Railway/Render).

> Lưu ý: Cấu hình đầy đủ các biến mật bằng **GitHub Secrets**.

## 7. Checklist Go-Live (Kiểm tra trước khi ra mắt)

1. [ ] Môi trường DB (Firebase) và Storage (R2) của Production độc lập với Dev.
2. [ ] Backend Ktor đã trỏ sang Firebase Production và R2 Production.
3. [ ] Các biến môi trường nhạy cảm không bị lộ trong repository.
4. [ ] Firestore Security Rules đã được apply.
5. [ ] Các Endpoint tạo Presigned URL hoạt động đúng chuẩn và đã có rate limiting.
6. [ ] Cấu hình CORS của Cloudflare R2 cho phép tải mô hình trực tiếp từ domain Web.
7. [ ] Models YOLO LiteRT (file .tflite) đã upload lên R2 và cập nhật đường dẫn vào Firestore.
8. [ ] Tính năng đăng ký/đăng nhập hoạt động trơn tru.
9. [ ] Ứng dụng Web load trang nhanh, SEO Meta tags đầy đủ.
10. [ ] Ứng dụng Android chạy không bị crash, giao diện responsive.
11. [ ] Đã cấp quyền camera mượt mà trên cả Web và Android.
12. [ ] Domain chính thức đã được trỏ tới Web App.
13. [ ] Admin Tool (có thể là code local/UI) đã set được custom claim `isAdmin` cho tài khoản của bạn.
14. [ ] Chứng chỉ SSL HTTPS hoạt động cho cả API Backend và Web.
15. [ ] Logs và Monitoring đã được bật.

## 8. Monitoring (Theo dõi sau triển khai)

- **Firebase Crashlytics:** Cài vào Android App để nhận báo cáo crash.
- **Sentry:** Tích hợp vào Web và Ktor Backend để quản lý lỗi/exception.
- **Cloudflare Analytics:** Giám sát lưu lượng tải file (mô hình/hình ảnh) trên R2 để dự báo chi phí và tối ưu băng thông.
