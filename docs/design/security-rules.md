# Row Level Security (RLS) — Supabase PostgreSQL

Tài liệu này quy định các chính sách bảo mật Row Level Security cho cơ sở dữ liệu PostgreSQL (Supabase) của dự án Sequoia.

## 1. Nguyên tắc: Defense-in-depth

Kiến trúc bảo mật của Sequoia dựa trên mô hình **Defense-in-depth (phòng thủ chiều sâu)**:

- **Lớp 1 (Next.js API Routes):** Là chốt chặn chính. Mọi request từ client (Web/Android) đều đi qua Next.js API Routes. API sẽ xác thực session, kiểm tra quyền truy cập, thực hiện business logic và chỉ khi hợp lệ mới tương tác với PostgreSQL qua Supabase Admin Client (`service_role` key, bypass RLS).
- **Lớp 2 (PostgreSQL RLS):** Đóng vai trò lớp bảo vệ dự phòng. Nếu có lỗ hổng trên API hoặc ai đó truy cập trực tiếp vào Supabase từ bên ngoài (dùng `anon` key), RLS sẽ đảm bảo dữ liệu vẫn an toàn và không bị thao tác trái phép.

## 2. Quy tắc cho từng bảng

- `users`: Người dùng chỉ có quyền đọc và ghi vào row của chính mình (`auth.uid()::text = id`), hoặc admin.
- `textbooks`: Bất kỳ ai cũng có thể đọc (public read), nhưng chỉ admin (kiểm tra qua JWT claim `is_admin`) mới được ghi/xóa/sửa.
- `topics`: Ai cũng có thể đọc, chỉ admin mới có quyền ghi.
- `articles`: Chỉ cho phép đọc các bài viết đã xuất bản (`is_published = true`), admin có thể đọc và ghi toàn bộ bài viết (kể cả bản nháp).
- `article_contents`: Ai cũng có thể đọc, chỉ admin mới có quyền ghi.
- `models`: Ai cũng có thể đọc thông tin cấu hình mô hình, chỉ admin mới có quyền ghi.
- `cosmos_maps`: Bất kỳ ai cũng có thể đọc dữ liệu bản đồ, nhưng chỉ admin mới có quyền ghi/sửa.
- `user_progress`: Người dùng chỉ có quyền đọc và ghi tiến độ học tập của chính mình, hoặc admin.

## 3. SQL Policies hoàn chỉnh

```sql
-- Helper function kiểm tra admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'is_admin')::boolean = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bật RLS cho tất cả bảng
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosmos_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Users & Progress: chỉ chính mình hoặc admin
CREATE POLICY "Users can access own profile"
  ON public.users FOR ALL
  USING (auth.uid()::text = id OR is_admin());

CREATE POLICY "Users can access own progress"
  ON public.user_progress FOR ALL
  USING (auth.uid()::text = id OR is_admin());

-- Topics: public read, admin write
CREATE POLICY "Public read topics"
  ON public.topics FOR SELECT USING (true);
CREATE POLICY "Admin write topics"
  ON public.topics FOR ALL USING (is_admin());

-- Textbooks: public read, admin write
CREATE POLICY "Public read textbooks"
  ON public.textbooks FOR SELECT USING (true);
CREATE POLICY "Admin write textbooks"
  ON public.textbooks FOR ALL USING (is_admin());

-- Models: public read, admin write
CREATE POLICY "Public read models"
  ON public.models FOR SELECT USING (true);
CREATE POLICY "Admin write models"
  ON public.models FOR ALL USING (is_admin());

-- Cosmos Maps: public read, admin write
CREATE POLICY "Public read cosmos_maps"
  ON public.cosmos_maps FOR SELECT USING (true);
CREATE POLICY "Admin write cosmos_maps"
  ON public.cosmos_maps FOR ALL USING (is_admin());

-- Articles: public read published, admin full access
CREATE POLICY "Public read published articles"
  ON public.articles FOR SELECT
  USING (is_published = true OR is_admin());
CREATE POLICY "Admin write articles"
  ON public.articles FOR ALL USING (is_admin());

-- Article Contents: public read, admin write
CREATE POLICY "Public read article contents"
  ON public.article_contents FOR SELECT USING (true);
CREATE POLICY "Admin write article contents"
  ON public.article_contents FOR ALL USING (is_admin());
```

## 4. Hướng dẫn test

Để đảm bảo an toàn, các chính sách RLS cần được kiểm tra kỹ lưỡng bằng **Supabase Local Development** trước khi deploy.

1. Khởi động Supabase local:

   ```bash
   npx supabase start
   ```

2. Kiểm tra RLS policies:
   - Test kịch bản user thường cố gắng sửa bài viết (phải bị từ chối).
   - Test kịch bản đọc bài chưa publish khi không phải admin (phải bị từ chối).
   - Test kịch bản admin thực hiện các thao tác (phải được phép).
   - Test kịch bản user cố truy cập `user_progress` của người khác (phải bị từ chối).

3. Sử dụng Supabase Dashboard (SQL Editor) để chạy các truy vấn test với các role khác nhau:

   ```sql
   -- Test với role anon
   SET ROLE anon;
   SELECT * FROM articles WHERE is_published = false;  -- Phải trả về 0 rows
   ```

## 5. Checklist review trước khi deploy

1. [ ] Mọi bảng đều đã được bật RLS (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)?
2. [ ] Các bảng công khai (topics, textbooks, models, cosmos_maps) đã có policy `FOR SELECT USING (true)`?
3. [ ] Bảng `users` đã kiểm tra chính xác ID của chủ sở hữu (`auth.uid()::text = id`)?
4. [ ] Quyền ghi (write) cho các nội dung công khai đã được giới hạn chỉ cho `is_admin()`?
5. [ ] Trường hợp đọc bài viết, đã kiểm tra flag `is_published` chưa?
6. [ ] Custom claim `is_admin` đã được cấu hình an toàn từ backend (`app_metadata`) và không thể bị giả mạo từ client?
7. [ ] Không có policy nào lạm dụng `USING (true)` cho quyền ghi ngoài ý muốn?
8. [ ] Đã test thử trên môi trường Supabase local trước khi áp dụng lên Production?
