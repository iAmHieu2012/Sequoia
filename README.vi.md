# Dự án Sequoia

Sequoia là nền tảng học thuật AI/ML có cấu trúc giáo trình, cho phép chạy mô hình AI trực tiếp trên thiết bị.

## Cấu trúc thư mục

- `docs/`: Chứa tài liệu đặc tả sản phẩm, thiết kế hệ thống, sơ đồ luồng người dùng và hướng dẫn cấu hình.
- `web/`: Ứng dụng Web xây dựng bằng Next.js.
- `android/`: Ứng dụng di động Native xây dựng bằng Kotlin & Jetpack Compose.
- `core/`: Backend API Gateway xử lý logic, phân quyền và kết nối Firebase/R2 xây dựng bằng Kotlin Ktor.

## Tài liệu

Vui lòng tham khảo thư mục `docs/` để xem chi tiết các đặc tả kỹ thuật.

## Cấu hình môi trường (Local Development)

### 1. Backend (Ktor)

```bash
cd core
./gradlew run
```

Server sẽ chạy tại `http://0.0.0.0:8080`.

### 2. Web Client (Next.js)

```bash
cd web
npm install
npm run dev
```

Ứng dụng Web sẽ chạy tại `http://localhost:3000`.
