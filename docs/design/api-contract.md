# API Contract — Sequoia Backend

> Tài liệu mô tả chi tiết API contract cho Next.js API Routes của Sequoia.
> Cập nhật lần cuối: 2026-08-19

---

## 1. Tổng quan

### Base URL

| Môi trường | Base URL |
| --- | --- |
| Development | `http://localhost:3000/api/v1` |
| Production | `https://sequoia.app/api/v1` |

### Versioning

API sử dụng URL path versioning: `/api/v1/...`. Khi có breaking changes, version mới sẽ được tạo (`/api/v2/...`) và version cũ được duy trì trong thời gian chuyển đổi.

### Authentication

Các endpoint yêu cầu xác thực sử dụng **Supabase Auth Session** (cookie-based cho Web, Bearer token cho Android):

```text
# Web: tự động gửi qua cookie bởi @supabase/ssr
Cookie: sb-<project-ref>-auth-token=...

# Android: gửi qua header
Authorization: Bearer <supabase-access-token>
```

Session được verify bởi Next.js API Routes (lớp 1) trước khi xử lý request.

### Error Format

Mọi lỗi trả về cùng format thống nhất:

```json
{
  "error": "Article not found"
}
```

### Bảng mã lỗi chung

| HTTP Status | Mô tả |
| --- | --- |
| 400 | Request thiếu field hoặc format sai |
| 401 | Thiếu hoặc sai session/token |
| 403 | Không có quyền truy cập (Admin privileges required) |
| 404 | Resource không tồn tại |
| 500 | Lỗi server không xác định |

---

## 2. Public Endpoints (Không cần Auth)

### 2.1. GET `/api/v1/textbooks` — Danh sách PDF

Lấy danh sách tất cả file PDF lưu trữ.

#### Response 200

```json
{
  "data": [
    {
      "id": "mml",
      "title": "Mathematics for Machine Learning",
      "description": "The fundamental mathematical tools...",
      "authors": ["Marc Peter Deisenroth", "A. Aldo Faisal", "Cheng Soon Ong"],
      "cover_image_url": "https://cdn.jsdelivr.net/.../mml.jpg",
      "pdf_url": "https://cdn.jsdelivr.net/.../mml.pdf",
      "sort_order": 1
    }
  ]
}
```

---

### 2.2. GET `/api/v1/topics` — Danh sách chủ đề

Lấy tất cả chủ đề, sắp xếp theo `sort_order`.

#### Response 200

```json
{
  "data": [
    {
      "id": "computer-vision",
      "name": "Computer Vision",
      "description": "Exploring visual data understanding...",
      "sort_order": 1,
      "article_count": 5,
      "created_at": "2026-07-24T10:00:00Z"
    }
  ]
}
```

---

### 2.3. GET `/api/v1/articles/:id` — Chi tiết bài viết

Lấy toàn bộ nội dung bài viết kèm metadata.

#### Response 200

```json
{
  "data": {
    "id": "image-classification",
    "title": "Image Classification Basics",
    "content": "## Image Classification\n\nImage classification is...",
    "summary": "An introduction to classifying images.",
    "topic_id": "computer-vision",
    "tags": ["cv", "classification"],
    "is_published": true,
    "created_at": "2026-07-24T10:00:00Z",
    "updated_at": "2026-07-25T14:30:00Z",
    "published_at": "2026-07-24T10:00:00Z"
  }
}
```

---

### 2.4. GET `/api/v1/models` — Danh sách models

Lấy tất cả thông tin mô hình AI.

#### Response 200

```json
{
  "data": [
    {
      "id": "yolov8n-detect",
      "name": "YOLOv8 Nano (Detect)",
      "description": "Real-time object detection model...",
      "task_type": "object-detection",
      "file_url": "https://cdn.jsdelivr.net/.../model.tflite",
      "metadata_url": "https://cdn.jsdelivr.net/.../metadata.json",
      "file_size_bytes": 12841243,
      "version": "1.0",
      "format": "litert"
    }
  ]
}
```

---

### 2.5. GET `/api/v1/cosmos/maps/:mapId` — Bản đồ sao

Trả về toàn bộ cấu trúc bản đồ. Tối ưu 1 query PostgreSQL.

#### Response 200

```json
{
  "data": {
    "id": "computer-vision",
    "map_type": "topic",
    "theme": "nebula",
    "nodes": [
      {
        "article_id": "image-classification",
        "title": "Image Classification Basics",
        "celestial_type": "star",
        "x": 7500,
        "y": 2500,
        "connections": []
      }
    ]
  }
}
```

---

## 3. Auth-Required Endpoints

### 3.1. GET `/api/v1/users/progress` — Tiến trình học tập

Trả về tiến trình của user đang đăng nhập.

#### Response 200

```json
{
  "data": {
    "current_streak": 5,
    "longest_streak": 5,
    "active_dates": ["2026-07-27", "2026-07-28", "2026-07-29"],
    "completed_article_ids": ["image-classification", "attention-paper"],
    "last_active": "2026-07-31T10:00:00Z"
  }
}
```

### 3.2. POST `/api/v1/users/progress` — Cập nhật tiến trình

Gọi khi người dùng hoàn thành bài viết hoặc đánh dấu hoạt động.

#### Request Body

```json
{
  "articleId": "image-classification",
  "localDate": "2026-08-01"
}
```

#### Response 200

```json
{
  "data": {
    "current_streak": 6,
    "longest_streak": 6
  }
}
```

---

## 4. Admin Endpoints (Yêu cầu `is_admin` claim)

Tất cả admin endpoints đều kiểm tra `user.app_metadata.is_admin === true`.

### 4.1. POST `/api/v1/admin/articles` — Tạo/Cập nhật bài viết

Sử dụng upsert — nếu article ID đã tồn tại thì cập nhật, nếu chưa thì tạo mới.

#### Request Body

```json
{
  "id": "image-classification",
  "title": "Image Classification Basics",
  "topic_id": "computer-vision",
  "summary": "An introduction to classifying images.",
  "tags": ["cv", "classification"],
  "is_published": true,
  "content": "## Image Classification\n\n...",
  "celestial_type": "star",
  "x": 7500,
  "y": 2500,
  "connections": []
}
```

> **Lưu ý:** `created_at` và `updated_at` **không** được gửi từ client. Database tự quản lý qua `DEFAULT now()` và trigger `set_updated_at()`.

---

### 4.2. GET `/api/v1/admin/articles/:id` — Lấy chi tiết bài viết (Admin)

Trả về bài viết kèm nội dung, bao gồm cả bài chưa publish.

---

### 4.3. DELETE `/api/v1/admin/articles/:id` — Xóa bài viết

Xóa bài viết và tự động:
- `article_contents` bị xóa theo CASCADE.
- `topics.article_count` được cập nhật bởi trigger.
- `user_progress.completed_article_ids` được dọn sạch bởi trigger.
- Cosmos map nodes được dọn trong API (cần JSONB manipulation).

---

### 4.4. POST `/api/v1/admin/topics` — Tạo/Cập nhật chủ đề

#### Request Body

```json
{
  "id": "computer-vision",
  "name": "Computer Vision",
  "description": "Exploring visual data understanding...",
  "sort_order": 1
}
```

> **Lưu ý:** `article_count` **không** được gửi từ client. Trigger tự tính.
> Khi tạo topic mới, trigger `trg_sync_topic_to_cosmos_map` tự tạo cosmos_maps entry.

---

### 4.5. DELETE `/api/v1/admin/topics/:id` — Xóa chủ đề

---

### 4.6. POST `/api/v1/admin/models` — Tạo/Cập nhật model

#### Request Body

```json
{
  "id": "yolov8n-detect",
  "name": "YOLOv8 Nano (Detect)",
  "description": "Real-time object detection model...",
  "task_type": "object-detection",
  "file_url": "https://cdn.jsdelivr.net/.../model.tflite",
  "metadata_url": "https://cdn.jsdelivr.net/.../metadata.json",
  "file_size_bytes": 12841243,
  "version": "1.0",
  "format": "litert"
}
```

---

### 4.7. POST `/api/v1/admin/textbooks` — Tạo/Cập nhật giáo trình

#### Request Body

```json
{
  "id": "mml",
  "title": "Mathematics for Machine Learning",
  "description": "The fundamental mathematical tools...",
  "authors": ["Marc Peter Deisenroth", "A. Aldo Faisal", "Cheng Soon Ong"],
  "cover_image_url": "https://cdn.jsdelivr.net/.../mml.jpg",
  "pdf_url": "https://cdn.jsdelivr.net/.../mml.pdf",
  "sort_order": 1
}
```

---

### 4.8. POST `/api/v1/admin/cosmos-maps` — Cập nhật bản đồ sao

#### Request Body

```json
{
  "id": "computer-vision",
  "nodes": [
    {
      "article_id": "image-classification",
      "title": "Image Classification Basics",
      "celestial_type": "star",
      "x": 7500,
      "y": 2500,
      "connections": []
    }
  ]
}
```

---

## 5. Authentication Note

> [!NOTE]
> Dự án Sequoia sử dụng kiến trúc **Supabase Auth trực tiếp trên Client (Frontend)**. Do đó, Backend không cung cấp API Đăng nhập hay Đăng ký.
> Thay vào đó, Frontend sử dụng Supabase Client SDK để đăng nhập bằng Email/Password hoặc Google OAuth. Sau khi đăng nhập thành công, session được lưu trong cookie (Web) hoặc memory (Android), và tự động gửi kèm khi gọi API.
