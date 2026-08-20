# Thiết kế Dữ liệu — Data Model (Supabase PostgreSQL)

> Tài liệu mô tả chi tiết cấu trúc dữ liệu PostgreSQL cho nền tảng Sequoia.
> Bao gồm kiến trúc tách biệt giữa Core Education Domain (dữ liệu học thuật) và Presentation Domain (The Neural Cosmos).
> Cập nhật lần cuối: 2026-08-19

---

## 1. Tổng quan Kiến trúc Dữ liệu

Hệ thống được thiết kế theo nguyên tắc **Separation of Concerns (Tách biệt mối quan tâm)** và **Query Optimization (Tối ưu truy vấn)**:

1. **Core Education Domain:** Chứa dữ liệu cốt lõi (Sách, Chủ đề, Bài viết, Model). Hoàn toàn tinh khiết, không chứa bất kỳ dữ liệu nào liên quan đến UI/UX hay Theme.
2. **Cosmos Game Domain (Presentation):** Chứa cấu hình hiển thị bản đồ và tiến trình học tập dưới dạng game hóa (Gamification). Sử dụng kỹ thuật **Denormalization (Chuẩn hóa ngược)** qua cột `JSONB nodes` để đảm bảo mỗi lần tải bản đồ chỉ tốn **2 queries** (1 cho map, 1 cho progress).

```mermaid
erDiagram
    users {
        TEXT id PK
        TEXT uid UK
        TEXT email
        TEXT display_name
        TEXT photo_url
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    textbooks {
        TEXT id PK
        TEXT title
        TEXT description
        TEXT[] authors
        TEXT cover_image_url
        TEXT pdf_url
        INTEGER sort_order
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    topics {
        TEXT id PK
        TEXT name
        TEXT description
        INTEGER article_count
        INTEGER sort_order
        TIMESTAMPTZ created_at
    }

    articles {
        TEXT id PK
        TEXT title
        TEXT summary
        TEXT topic_id FK
        TEXT[] tags
        BOOLEAN is_published
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ published_at
    }

    article_contents {
        TEXT id PK_FK
        TEXT content
    }

    models {
        TEXT id PK
        TEXT name
        TEXT description
        TEXT task_type
        TEXT file_url
        TEXT metadata_url
        BIGINT file_size_bytes
        TEXT version
        TEXT format
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    cosmos_maps {
        TEXT id PK
        TEXT map_type
        TEXT theme
        JSONB nodes
        TIMESTAMPTZ created_at
    }

    user_progress {
        TEXT id PK_FK
        INTEGER current_streak
        INTEGER longest_streak
        DATE[] active_dates
        TEXT[] completed_article_ids
        TIMESTAMPTZ last_active
    }

    topics ||--o{ articles : "chứa"
    articles ||--|| article_contents : "ON DELETE CASCADE"
    cosmos_maps ||--|| topics : "map UI cho"
    user_progress }o--|| users : "ON DELETE CASCADE"
```

---

## 2. Core Education Domain

Các bảng này giữ nguyên tính trừu tượng của một CMS giáo dục.

### 2.1. `users`
| Column | Type | Constraint | Description |
| --- | --- | --- | --- |
| `id` | `TEXT` | PRIMARY KEY | Trùng với Supabase Auth UID |
| `uid` | `TEXT` | UNIQUE NOT NULL | Supabase Auth UID |
| `email` | `TEXT` | | Email đăng ký |
| `display_name` | `TEXT` | | Tên hiển thị |
| `photo_url` | `TEXT` | | URL ảnh đại diện |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Thời điểm tạo |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | Tự động cập nhật bởi trigger `set_updated_at()` |

### 2.2. `textbooks` (Kho lưu trữ PDF)
| Column | Type | Constraint | Description |
| --- | --- | --- | --- |
| `id` | `TEXT` | PRIMARY KEY | ID duy nhất |
| `title` | `TEXT` | NOT NULL | Tên tài liệu/giáo trình |
| `description` | `TEXT` | | Mô tả ngắn |
| `authors` | `TEXT[]` | DEFAULT '{}' | Danh sách tác giả |
| `cover_image_url` | `TEXT` | | Ảnh bìa |
| `pdf_url` | `TEXT` | | URL tải file PDF |
| `sort_order` | `INTEGER` | DEFAULT 0 | Thứ tự sắp xếp |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Thời điểm tạo |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | Trigger `set_updated_at()` |

### 2.3. `topics` (Chủ đề học tập)
| Column | Type | Constraint | Description |
| --- | --- | --- | --- |
| `id` | `TEXT` | PRIMARY KEY | ID duy nhất |
| `name` | `TEXT` | NOT NULL | Tên chủ đề |
| `description` | `TEXT` | | Mô tả ngắn |
| `article_count` | `INTEGER` | DEFAULT 0 | Tự động cập nhật bởi trigger `trg_update_topic_article_count` |
| `sort_order` | `INTEGER` | DEFAULT 0 | Thứ tự sắp xếp |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Thời điểm tạo |

### 2.4. `articles` (Thông tin bài viết - Metadata)
| Column | Type | Constraint | Description |
| --- | --- | --- | --- |
| `id` | `TEXT` | PRIMARY KEY | ID duy nhất |
| `title` | `TEXT` | NOT NULL | Tiêu đề |
| `summary` | `TEXT` | | Tóm tắt ngắn gọn |
| `topic_id` | `TEXT` | FK → topics(id) ON DELETE SET NULL | Ref đến `topics` (null nếu là bài viết tự do) |
| `tags` | `TEXT[]` | DEFAULT '{}' | Các thẻ phân loại bài viết |
| `is_published` | `BOOLEAN` | DEFAULT false | Cờ trạng thái xuất bản |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Thời điểm tạo |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | Trigger `set_updated_at()` |
| `published_at` | `TIMESTAMPTZ` | | Thời điểm xuất bản (set bởi API) |

### 2.5. `article_contents` (Nội dung chi tiết)
*Lưu ý: Primary Key của bảng này bắt buộc trùng khớp 1:1 với PK của bảng `articles`, với ràng buộc `ON DELETE CASCADE`.*

| Column | Type | Constraint | Description |
| --- | --- | --- | --- |
| `id` | `TEXT` | PK, FK → articles(id) ON DELETE CASCADE | Trùng khớp với ID bài viết |
| `content` | `TEXT` | NOT NULL | Nội dung Markdown |

### 2.6. `models` (Mô hình AI)
| Column | Type | Constraint | Description |
| --- | --- | --- | --- |
| `id` | `TEXT` | PRIMARY KEY | ID duy nhất |
| `name` | `TEXT` | NOT NULL | Tên model |
| `description` | `TEXT` | | Mô tả mô hình |
| `task_type` | `TEXT` | | Loại tác vụ (vd: object-detection) |
| `file_url` | `TEXT` | | URL tải file `.tflite` |
| `metadata_url` | `TEXT` | | URL trỏ tới file metadata.json trên CDN |
| `file_size_bytes` | `BIGINT` | DEFAULT 0 | Dung lượng file byte |
| `version` | `TEXT` | DEFAULT '1.0' | Phiên bản |
| `format` | `TEXT` | DEFAULT 'litert' | Định dạng (vd: litert, tflite) |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Thời điểm tạo |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | Trigger `set_updated_at()` |

---

## 3. Cosmos Game Domain (Presentation)

Đây là tầng UI/UX. Mỗi bản đồ có 100 ngôi sao cũng chỉ tốn **1 query** thay vì 100 queries nhờ cột JSONB.

### 3.1. `cosmos_maps` (Cấu hình bản đồ không gian)
ID bắt buộc trùng với `topic_id` (đối với Chủ đề). Riêng với loại `rogue-anomalies`, bản đồ chứa các bài viết tự do (`topic_id = null`) nên ID là độc lập (ví dụ: `"standalone-articles"`). Trigger `trg_sync_topic_to_cosmos_map` tự tạo map khi có topic mới.

| Column | Type | Constraint | Description |
| --- | --- | --- | --- |
| `id` | `TEXT` | PRIMARY KEY | Map 1:1 với `topics` (trừ `rogue-anomalies`) |
| `map_type` | `TEXT` | NOT NULL | Loại bản đồ: `"topic"`, `"rogue-anomalies"` |
| `theme` | `TEXT` | DEFAULT 'nebula' | Theme đang dùng |
| `nodes` | `JSONB` | DEFAULT '[]' | Mảng chứa toàn bộ các ngôi sao trên bản đồ |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Thời điểm tạo |

**Cấu trúc JSONB `nodes`:**

| Field | Type | Description |
| --- | --- | --- |
| `article_id` | `string` | ID bài viết tương ứng |
| `title` | `string` | Tiêu đề (Denormalized để tránh JOIN) |
| `celestial_type` | `string` | Loại sao: `"star"`, `"binary_star"`, `"anomaly"`, `"nebula"`, `"black_hole"` |
| `x` | `number` | Tọa độ X trên bản đồ |
| `y` | `number` | Tọa độ Y trên bản đồ |
| `connections` | `string[]` | Mảng các `article_id` mà sao này nối tới (để vẽ tia sáng) |

### 3.2. `user_progress` (Tiến trình giải mã)
ID là `user_id` (FK → users.id ON DELETE CASCADE). Gộp toàn bộ tiến trình của 1 user vào 1 row duy nhất.

| Column | Type | Constraint | Description |
| --- | --- | --- | --- |
| `id` | `TEXT` | PK, FK → users(id) ON DELETE CASCADE | User ID |
| `current_streak` | `INTEGER` | DEFAULT 0 | Số ngày chuỗi liên tiếp hiện tại |
| `longest_streak` | `INTEGER` | DEFAULT 0 | Kỷ lục chuỗi dài nhất |
| `active_dates` | `DATE[]` | DEFAULT '{}' | Mảng các ngày đã hoạt động (YYYY-MM-DD) |
| `completed_article_ids` | `TEXT[]` | DEFAULT '{}' | Danh sách ID bài viết đã hoàn thành |
| `last_active` | `TIMESTAMPTZ` | DEFAULT now() | Lần cuối hoạt động |

---

## 4. Database Triggers

Các trigger tự động duy trì tính toàn vẹn dữ liệu:

| Trigger | Bảng | Thời điểm | Chức năng |
| --- | --- | --- | --- |
| `set_*_updated_at` | users, articles, textbooks, models | BEFORE UPDATE | Tự động set `updated_at = now()` |
| `on_auth_user_created` | auth.users | AFTER INSERT | Tự tạo row `users` + `user_progress` khi signup |
| `trg_update_topic_article_count` | articles | AFTER INSERT/DELETE/UPDATE OF topic_id | Đếm lại `COUNT(*)` và cập nhật `topics.article_count` |
| `trg_sync_topic_to_cosmos_map` | topics | AFTER INSERT | Tự tạo row `cosmos_maps` rỗng cho topic mới |
| `trg_cleanup_article_from_progress` | articles | AFTER DELETE | Xóa article_id khỏi mảng `completed_article_ids` trong `user_progress` |

---

## 5. Phân tích chi phí truy vấn

Khi người dùng mở ứng dụng và tải một Bản đồ Sao:
1. `SELECT * FROM cosmos_maps WHERE id = $1` → **1 Query**. (Lấy toàn bộ cấu trúc bản đồ, vị trí, tên bài học từ JSONB).
2. `SELECT * FROM user_progress WHERE id = $1` → **1 Query**. (Lấy mảng ID đã học để tính toán trạng thái).

**Tổng chi phí: 2 Queries / user / map load.** Bất kể bản đồ lớn cỡ nào. Kiến trúc JSONB giải quyết triệt để vấn đề N+1 Query.
