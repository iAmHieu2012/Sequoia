# Dự án Sequoia

Sequoia là nền tảng học thuật AI/ML có cấu trúc giáo trình, cho phép chạy mô hình AI trực tiếp trên thiết bị.

## Cấu trúc thư mục

- `docs/`: Chứa tài liệu đặc tả sản phẩm, thiết kế hệ thống, sơ đồ luồng người dùng và hướng dẫn cấu hình.
- `web/`: Ứng dụng Next.js full-stack (Frontend + API Routes + tích hợp Supabase).
- `android/`: Ứng dụng di động Native xây dựng bằng Kotlin & Jetpack Compose.

## Tài liệu

Vui lòng tham khảo thư mục `docs/` để xem chi tiết các đặc tả kỹ thuật.

## Cấu hình môi trường (Local Development)

### 1. Web App (Next.js Full-stack)

```bash
cd web
npm install
npm run dev
```

Ứng dụng Web (Frontend + API) sẽ chạy tại `http://localhost:3000`.

### 2. Database (Supabase)

```bash
cd web
npx supabase start
```

Chạy file migration: `web/supabase/migrations/00_reset_and_init.sql`.

### 3. Seed Data

```bash
cd web
npx tsx scripts/seed.ts
```
