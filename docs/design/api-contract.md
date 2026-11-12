# API Contract — Sequoia Backend

> Tài liệu mô tả API contract cho Next.js API Routes của Sequoia, khớp với code trong `src/app/api/`.
> Cập nhật lần cuối: 2026-11-12

---

## 1. Tổng quan

### Base URL

| Môi trường | Base URL |
| --- | --- |
| Development | `http://localhost:3000/api/v1` |
| Production | `https://sequoia.app/api/v1` |

Riêng AI Assistant nằm ngoài versioning: `/api/chat`.

### Versioning

API sử dụng URL path versioning: `/api/v1/...`. Khi có breaking changes, version mới sẽ được tạo (`/api/v2/...`) và version cũ được duy trì trong thời gian chuyển đổi.

### Authentication

Các endpoint yêu cầu xác thực sử dụng **Supabase Auth Session** (cookie-based):

```text
# Tự động gửi qua cookie bởi @supabase/ssr
Cookie: sb-<project-ref>-auth-token=...
```

Session được verify bởi Next.js API Routes (lớp 1) trước khi xử lý request.

### Response Format

Thành công: dữ liệu nằm trong `data`.

```json
{ "data": { } }
```

Lỗi: một chuỗi trong `error`.

```json
{ "error": "Article not found" }
```

### Bảng mã lỗi chung

| HTTP Status | Mô tả |
| --- | --- |
| 400 | Request thiếu field hoặc format sai |
| 401 | Chưa đăng nhập hoặc session không hợp lệ |
| 403 | Không có quyền truy cập (`Admin privileges required`) |
| 404 | Resource không tồn tại (bài chưa xuất bản cũng trả 404) |
| 413 | Request quá lớn (dùng ở `/api/chat`) |
| 500 | Lỗi server không xác định |

### Danh sách endpoint

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/health` | Không |
| GET | `/textbooks` | Không |
| GET | `/textbooks/:id` | Không |
| GET | `/topics` | Không |
| GET | `/topics/:id/articles` | Không |
| GET | `/articles/standalone` | Không |
| GET | `/articles/:id` | Không |
| GET | `/models` | Không |
| GET | `/models/:id` | Không |
| GET | `/cosmos/maps/:mapId` | Không |
| GET | `/users/me` | User |
| GET | `/users/progress` | User |
| GET | `/users/progress/summary` | User |
| POST | `/articles/:id/progress` | User |
| POST | `/uploads/presigned-url` | User |
| POST | `/cosmos/progress/:mapId/decode` | User (chưa dùng) |
| POST | `/api/chat` | User |
| GET | `/admin/articles/standalone` | Admin |
| GET | `/admin/topics/:id/articles` | Admin |
| GET | `/admin/articles/:id` | Admin |
| POST | `/admin/articles` | Admin |
| DELETE | `/admin/articles/:id` | Admin |
| POST | `/admin/topics` | Admin |
| DELETE | `/admin/topics/:id` | Admin |
| POST | `/admin/models` | Admin |
| DELETE | `/admin/models/:id` | Admin |
| POST | `/admin/textbooks` | Admin |
| DELETE | `/admin/textbooks/:id` | Admin |
| PUT | `/admin/cosmos/maps/:mapId` | Admin |

---

## 2. Public Endpoints (Không cần Auth)

### 2.1. GET `/api/v1/health` — Kiểm tra server

#### Response 200

```json
{ "status": "ok", "service": "sequoia-web" }
```

---

### 2.2. GET `/api/v1/textbooks` — Danh sách giáo trình

Lấy tất cả giáo trình, sắp xếp theo `sort_order`.

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
      "sort_order": 1,
      "created_at": "2026-07-24T10:00:00Z",
      "updated_at": "2026-07-24T10:00:00Z"
    }
  ]
}
```

### 2.3. GET `/api/v1/textbooks/:id` — Chi tiết giáo trình

Trả về một giáo trình (cùng cấu trúc như phần tử trong 2.2). `404` nếu không tồn tại.

---

### 2.4. GET `/api/v1/topics` — Danh sách chủ đề

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

> `article_count` đếm mọi bài trong topic, kể cả bài nháp.

### 2.5. GET `/api/v1/topics/:id/articles` — Bài viết trong chủ đề

Chỉ trả về bài **đã xuất bản**, sắp xếp theo `published_at` tăng dần. Không kèm nội dung (`content`).

#### Response 200

```json
{
  "data": [
    {
      "id": "image-classification",
      "title": "Image Classification Basics",
      "topic_id": "computer-vision",
      "summary": "An introduction to classifying images.",
      "tags": ["cv", "classification"],
      "is_published": true,
      "created_at": "2026-07-24T10:00:00Z",
      "updated_at": "2026-07-25T14:30:00Z",
      "published_at": "2026-07-24T10:00:00Z"
    }
  ]
}
```

### 2.6. GET `/api/v1/articles/standalone` — Bài viết lẻ (Rogue)

Bài **đã xuất bản** không thuộc topic nào (`topic_id = null`), sắp xếp theo `published_at` giảm dần. Cấu trúc giống 2.5.

---

### 2.7. GET `/api/v1/articles/:id` — Chi tiết bài viết

Trả về metadata kèm nội dung Markdown. Bài **chưa xuất bản** trả `404`.

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

> Trang `/articles/:id` của web không gọi endpoint này mà đọc database trực tiếp ở server, với cùng quy tắc: chỉ bài đã xuất bản.

---

### 2.8. GET `/api/v1/models` — Danh sách models

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
      "format": "litert",
      "created_at": "2026-07-24T10:00:00Z",
      "updated_at": "2026-07-24T10:00:00Z"
    }
  ]
}
```

> `task_type` có thể là `null`.

### 2.9. GET `/api/v1/models/:id` — Chi tiết model

Trả về một model (cùng cấu trúc như phần tử trong 2.8). `404` nếu không tồn tại.

---

### 2.10. GET `/api/v1/cosmos/maps/:mapId` — Bản đồ sao

`mapId` là ID của topic, hoặc `standalone-articles` cho bản đồ bài lẻ.

- Người dùng thường: `nodes` chỉ chứa bài **đã xuất bản**, và `connections` trỏ tới bài nháp cũng bị lược bỏ.
- Admin: nhận đầy đủ mọi node (để Map Editor lưu lại không làm mất node của bài nháp).

#### Response 200

```json
{
  "data": {
    "id": "computer-vision",
    "map_type": "topic",
    "theme": "nebula",
    "created_at": "2026-07-24T10:00:00Z",
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

### 3.1. GET `/api/v1/users/me` — Thông tin user

Trả về object user của Supabase Auth (`id`, `email`, `user_metadata`, `app_metadata`, ...).

---

### 3.2. GET `/api/v1/users/progress?localDate=YYYY-MM-DD` — Tiến trình học tập

Trả về tiến trình của user đang đăng nhập.

| Query | Bắt buộc | Mô tả |
| --- | --- | --- |
| `localDate` | Không | Ngày hôm nay theo giờ máy người dùng. Nếu có và khác ngày hoạt động gần nhất, server cập nhật streak và ghi vào database |

> **Lưu ý:** dù là GET, endpoint này **có ghi dữ liệu** (cập nhật streak) ở lần gọi đầu tiên trong ngày khi có `localDate`.

Quy tắc streak: ngày kế tiếp ngày hoạt động gần nhất → `current_streak + 1`; cách hơn 1 ngày → reset về `1`; `longest_streak` luôn là giá trị lớn nhất đã đạt.

#### Response 200

```json
{
  "data": {
    "id": "<user-id>",
    "current_streak": 5,
    "longest_streak": 5,
    "active_dates": ["2026-07-27", "2026-07-28", "2026-07-29"],
    "completed_article_ids": ["image-classification", "attention-paper"],
    "last_active": "2026-07-31T10:00:00Z"
  }
}
```

---

### 3.3. GET `/api/v1/users/progress/summary` — Tổng hợp tiến trình

Đếm số bài đã hoàn thành theo từng topic, và trạng thái từng bài lẻ. Chỉ tính bài đã xuất bản.

#### Response 200

```json
{
  "data": {
    "topics": {
      "computer-vision": { "total": 5, "completed": 2 }
    },
    "standalone": {
      "attention-paper": true,
      "resnet-paper": false
    }
  }
}
```

---

### 3.4. POST `/api/v1/articles/:id/progress` — Đánh dấu hoàn thành bài viết

Gọi khi người dùng bấm "MARK DECODED" hoặc "REVERT STATUS" ở cuối bài.

#### Request Body

```json
{ "completed": true }
```

`completed` mặc định là `true` nếu không gửi. `false` để bỏ đánh dấu.

#### Response 200

```json
{
  "data": { "articleId": "image-classification", "newStatus": true }
}
```

---

### 3.5. POST `/api/v1/uploads/presigned-url` — URL upload (Supabase Storage)

Tạo signed upload URL cho Supabase Storage.

#### Request Body

```json
{ "bucket": "uploads", "path": "user_<id>/<timestamp>" }
```

Cả hai field đều tùy chọn (giá trị mặc định như trên).

> Hiện frontend không gọi endpoint này. Ảnh bài viết được upload thẳng lên Cloudinary.

---

### 3.6. POST `/api/v1/cosmos/progress/:mapId/decode` — (chưa dùng)

Endpoint giữ chỗ, chưa có logic. Chỉ trả về một message xác nhận.

---

### 3.7. POST `/api/chat` — AI Assistant

Stream câu trả lời từ Google Gemini (định dạng UI message stream của Vercel AI SDK).

#### Request Body

```json
{
  "messages": [ { "role": "user", "parts": [ { "type": "text", "text": "..." } ] } ],
  "modelId": "gemini-3.5-flash-lite"
}
```

| Ràng buộc | Giá trị |
| --- | --- |
| `modelId` cho phép | `gemini-3.5-flash-lite`, `gemini-3.5-flash`. Giá trị khác → tự dùng `gemini-3.5-flash-lite` |
| Số tin nhắn tối đa | 40 (vượt → `413`) |
| Tổng độ dài text tối đa | 40.000 ký tự (vượt → `413`) |
| Độ dài câu trả lời tối đa | 4.096 token |

---

## 4. Admin Endpoints (Yêu cầu `is_admin` claim)

Tất cả admin endpoints đều kiểm tra `user.app_metadata.is_admin === true`, sai thì trả `403`.

### 4.1. GET `/api/v1/admin/articles/standalone` — Bài lẻ (gồm bài nháp)

Như 2.6 nhưng gồm cả bài chưa xuất bản.

### 4.2. GET `/api/v1/admin/topics/:id/articles` — Bài trong topic (gồm bài nháp)

Như 2.5 nhưng gồm cả bài chưa xuất bản.

### 4.3. GET `/api/v1/admin/articles/:id` — Chi tiết bài viết (Admin)

Như 2.7 nhưng trả cả bài chưa xuất bản.

---

### 4.4. POST `/api/v1/admin/articles` — Tạo/Cập nhật bài viết

Upsert: nếu article ID đã tồn tại thì cập nhật, chưa có thì tạo mới. Không gửi `id` thì server sinh ID từ `title` (chữ thường, ký tự ngoài `a-z0-9` thành `-`).

#### Request Body

```json
{
  "id": "image-classification",
  "title": "Image Classification Basics",
  "topic_id": "computer-vision",
  "summary": "An introduction to classifying images.",
  "tags": ["cv", "classification"],
  "is_published": false,
  "content": "## Image Classification\n\n...",
  "celestial_type": "star",
  "x": 7500,
  "y": 2500,
  "connections": []
}
```

- `topic_id` rỗng hoặc `null` → bài lẻ, node được đặt vào bản đồ `standalone-articles`.
- `is_published` mặc định `false`.
- Server tự đồng bộ node của bài trên Cosmos map (chuyển map nếu đổi topic), và làm mới trang `/articles/:id`.

> **Lưu ý:** `created_at` và `updated_at` **không** được gửi từ client. Database tự quản lý qua `DEFAULT now()` và trigger `set_updated_at()`.

#### Response 200

```json
{ "data": { "id": "image-classification", "title": "...", "topic_id": "...", "summary": "...", "tags": [], "is_published": false } }
```

---

### 4.5. DELETE `/api/v1/admin/articles/:id` — Xóa bài viết

Xóa bài viết và tự động:
- `article_contents` bị xóa theo CASCADE.
- `topics.article_count` được cập nhật bởi trigger.
- `user_progress.completed_article_ids` được dọn sạch bởi trigger.
- Node và các connection trỏ tới bài được gỡ khỏi Cosmos map (trong API).
- Trang `/articles/:id` được làm mới.

#### Response 200

```json
{ "success": true }
```

---

### 4.6. POST `/api/v1/admin/topics` — Tạo/Cập nhật chủ đề

#### Request Body

```json
{
  "id": "computer-vision",
  "name": "Computer Vision",
  "description": "Exploring visual data understanding...",
  "sort_order": 1
}
```

Không gửi `id` thì server sinh ID từ `name`.

> **Lưu ý:** `article_count` **không** được gửi từ client. Trigger tự tính.
> Khi tạo topic mới, trigger `trg_sync_topic_to_cosmos_map` tự tạo cosmos_maps entry.

---

### 4.7. DELETE `/api/v1/admin/topics/:id` — Xóa chủ đề

- Xóa Cosmos map của topic.
- Các bài trong topic **không bị xóa** mà chuyển thành bài lẻ (`topic_id = null`), node được thêm vào bản đồ `standalone-articles` ở vị trí ngẫu nhiên gần tâm.

#### Response 200

```json
{ "success": true }
```

---

### 4.8. POST `/api/v1/admin/models` — Tạo/Cập nhật model

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

Không gửi `id` thì server sinh ID từ `name`.

### 4.9. DELETE `/api/v1/admin/models/:id` — Xóa model

#### Response 200

```json
{ "success": true }
```

---

### 4.10. POST `/api/v1/admin/textbooks` — Tạo/Cập nhật giáo trình

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

Không gửi `id` thì server sinh ID từ `title`.

### 4.11. DELETE `/api/v1/admin/textbooks/:id` — Xóa giáo trình

#### Response 200

```json
{ "success": true }
```

---

### 4.12. PUT `/api/v1/admin/cosmos/maps/:mapId` — Cập nhật bản đồ sao

Ghi đè **toàn bộ** danh sách node của bản đồ (dùng bởi nút SAVE MAP trong Map Editor). `404` nếu bản đồ không tồn tại.

#### Request Body

```json
{
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

#### Response 200

```json
{ "success": true }
```

---

## 5. Authentication Note

> [!NOTE]
> Dự án Sequoia sử dụng kiến trúc **Supabase Auth trực tiếp trên Client (Frontend)**. Do đó, Backend không cung cấp API Đăng nhập hay Đăng ký.
> Thay vào đó, Frontend sử dụng Supabase Client SDK để đăng nhập bằng Email/Password hoặc Google OAuth. Sau khi đăng nhập thành công, session được lưu trong cookie, và tự động gửi kèm khi gọi API.
