# Bảo mật dữ liệu — Firebase Auth + Supabase PostgreSQL

Tài liệu này quy định cách Sequoia xác thực người dùng và bảo vệ dữ liệu. Nguồn chuẩn của schema và policy là `supabase/migrations/00_init.sql`.

## 1. Nguyên tắc

- **Xác thực (authentication) là Firebase Auth.** Người dùng đăng nhập bằng Email/Password hoặc Google trên trình duyệt. Supabase không bao giờ nhận token của người dùng.
- **Phân quyền (authorization) nằm ở Next.js API Routes.** Mọi request cần đăng nhập gửi kèm `Authorization: Bearer <Firebase ID token>`. API kiểm tra token bằng `firebase-admin` qua `requireUser` / `requireAdmin` (`src/lib/auth/server.ts`), rồi mới đọc/ghi database bằng Supabase Admin Client (`service_role`).
- **PostgreSQL RLS chỉ phục vụ khóa `anon`.** Vì không có token người dùng nào tới Supabase, mọi truy cập vào Postgres chỉ có hai dạng:
  - `anon`: đọc nội dung công khai (trang tĩnh, API công khai). RLS giới hạn nó ở nội dung đã xuất bản.
  - `service_role`: API sau khi đã kiểm tra quyền. Bỏ qua RLS.

Hệ quả: **an toàn của dữ liệu người dùng và mọi thao tác ghi phụ thuộc vào việc mọi route gọi `requireUser` / `requireAdmin` trước khi dùng `supabaseService`.**

## 2. Quyền admin

- Admin là người có custom claim `admin: true` trên Firebase. Đặt bằng `npx tsx scripts/make_admin.ts <email>`.
- Claim chỉ đặt được từ server (Firebase Admin SDK), client không giả mạo được.
- Claim có hiệu lực khi token được cấp lại: trong vòng 1 giờ, hoặc ngay khi đăng xuất rồi đăng nhập lại.
- Trang `/genesis` ẩn với người không phải admin chỉ để tiện giao diện. Quyền thật được kiểm tra ở từng route `/api/v1/admin/*`.

## 3. Quy tắc cho từng bảng (khóa `anon`)

| Bảng | `anon` đọc được | `anon` ghi được |
| --- | --- | --- |
| `topics`, `textbooks`, `models` | Tất cả | Không |
| `cosmos_maps` | Tất cả (route `GET /cosmos/maps/:id` lọc bỏ node của bài nháp) | Không |
| `articles` | Chỉ `is_published = true` | Không |
| `article_contents` | Chỉ khi bài tương ứng đã xuất bản | Không |
| `users`, `user_progress` | Không | Không |

`anon` chỉ được `GRANT SELECT` trên các bảng nội dung. `users` và `user_progress` bật RLS nhưng không có policy nào, nên chỉ `service_role` chạm tới được.

## 4. Hướng dẫn test

1. Trên SQL Editor của Supabase, kiểm tra với role `anon`:

   ```sql
   SET ROLE anon;
   SELECT count(*) FROM articles WHERE is_published = false;  -- Phải trả về 0
   SELECT * FROM user_progress;                                -- Phải báo lỗi quyền
   INSERT INTO topics (id, name) VALUES ('x', 'x');            -- Phải báo lỗi quyền
   RESET ROLE;
   ```

2. Kiểm tra API:
   - Gọi `/api/v1/users/progress` không có token: phải trả `401`.
   - Gọi `/api/v1/admin/*` bằng token của user thường: phải trả `403`.
   - Đăng nhập admin, tạo/sửa/xóa bài viết: phải thành công.

## 5. Checklist review trước khi deploy

1. [ ] Mọi route đọc/ghi dữ liệu người dùng gọi `requireUser`, mọi route admin gọi `requireAdmin`, trước khi dùng `supabaseService`?
2. [ ] Route công khai dùng `supabasePublic` (anon), không dùng `supabaseService`?
3. [ ] Mọi bảng đều bật RLS, và `anon` không có quyền ghi?
4. [ ] `SUPABASE_SERVICE_ROLE_KEY` và `FIREBASE_SERVICE_ACCOUNT` chỉ có ở server, không có tiền tố `NEXT_PUBLIC_`?
5. [ ] Claim `admin` chỉ được đặt bằng `scripts/make_admin.ts`?
