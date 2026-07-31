# Thiết kế Firestore — Data Model

> Tài liệu mô tả chi tiết cấu trúc dữ liệu Firestore cho nền tảng Sequoia.
> Bao gồm kiến trúc tách biệt giữa Core Education Domain (dữ liệu học thuật) và Presentation Domain (The Neural Cosmos).
> Cập nhật lần cuối: 2026-07-24

---

## 1. Tổng quan Kiến trúc Dữ liệu

Hệ thống được thiết kế theo nguyên tắc **Separation of Concerns (Tách biệt mối quan tâm)** và **Cost Optimization (Tối ưu chi phí đọc/ghi trên Firestore)**:

1. **Core Education Domain:** Chứa dữ liệu cốt lõi (Sách, Chương, Bài học, Model). Hoàn toàn tinh khiết, không chứa bất kỳ dữ liệu nào liên quan đến UI/UX hay Theme.
2. **Cosmos Game Domain (Presentation):** Chứa cấu hình hiển thị bản đồ và tiến trình học tập dưới dạng game hóa (Gamification). Sử dụng kỹ thuật **Denormalization (Chuẩn hóa ngược)** và **Aggregation (Gộp dữ liệu)** để đảm bảo mỗi lần tải bản đồ chỉ tốn tối đa **2 reads**, tiết kiệm tối đa chi phí.

```mermaid
erDiagram
    users {
        string id PK
        string uid
        string email
        string displayName
        string photoUrl
        number createdAt
        number updatedAt
    }

    textbooks {
        string id PK
        string title
        string description
        string pdfUrl
        string coverImageUrl
    }

    topics {
        string id PK
        string name
        string description
        string iconUrl
        number sortOrder
        number articleCount
        number createdAt
    }

    articles {
        string id PK
        string title
        string slug
        string summary
        string topicId FK
        array tags
        boolean isPublished
        number createdAt
        number updatedAt
        number publishedAt
    }

    article_contents {
        string id PK
        string content
        array playgroundBlocks
    }

    models {
        string id PK
        string name
        string description
        string taskType
        string fileUrl
        number fileSizeBytes
        string version
        string format
        map defaultConfig
        number createdAt
        number updatedAt
    }

    cosmos_maps {
        string id PK
        string mapType
        string theme
        array nodes
    }

    user_progress {
        string id PK
        string userId FK
        string mapId FK
        map progressMap
    }

    topics ||--o{ articles : "chứa"
    articles ||--|| article_contents : "có nội dung"
    cosmos_maps ||--|| topics : "map UI cho"
    user_progress }o--|| users : "tiến độ của"
```

---

## 2. Core Education Domain

Các Collection này giữ nguyên tính trừu tượng của một CMS giáo dục.

### 2.1. `users`
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ | Document ID |
| `uid` | `string` | ✅ | Firebase Auth UID |
| `email` | `string` | ✅ | Email đăng ký |
| `displayName` | `string` | ✅ | Tên hiển thị |
| `photoUrl` | `string` | ❌ | URL ảnh đại diện |
| `createdAt` | `number` | ✅ | Thời điểm tạo |
| `updatedAt` | `number` | ✅ | Thời điểm cập nhật cuối |

### 2.2. `textbooks` (Kho lưu trữ PDF)
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ | Document ID |
| `title` | `string` | ✅ | Tên tài liệu/giáo trình |
| `description` | `string` | ✅ | Mô tả ngắn |
| `pdfUrl` | `string` | ✅ | URL tải file PDF |
| `coverImageUrl` | `string` | ✅ | Ảnh bìa |

### 2.3. `topics` (Chủ đề học tập)
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ | Document ID |
| `name` | `string` | ✅ | Tên chủ đề |
| `description` | `string` | ✅ | Mô tả ngắn |
| `iconUrl` | `string` | ❌ | Ảnh đại diện/Icon |
| `sortOrder` | `number` | ✅ | Thứ tự sắp xếp |
| `articleCount` | `number` | ✅ | Số bài viết trong chủ đề |
| `createdAt` | `number` | ✅ | Thời điểm tạo |

### 2.4. `articles` (Thông tin bài viết - Metadata)
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ | Document ID |
| `title` | `string` | ✅ | Tiêu đề |
| `slug` | `string` | ✅ | URL-friendly slug |
| `summary` | `string` | ✅ | Tóm tắt ngắn gọn |
| `topicId` | `string` | ❌ | Ref đến `topics` (null nếu là bài viết tự do) |
| `tags` | `array<string>`| ✅ | Các thẻ phân loại bài viết |
| `isPublished` | `boolean` | ✅ | Cờ trạng thái xuất bản |
| `createdAt` | `number` | ✅ | Thời điểm tạo |
| `updatedAt` | `number` | ✅ | Thời điểm cập nhật cuối |
| `publishedAt` | `number` | ✅ | Thời điểm xuất bản |

### 2.5. `article_contents` (Nội dung chi tiết)
*Lưu ý: Document ID của bảng này bắt buộc phải trùng khớp 1:1 với Document ID của bảng `articles` để dễ query.*

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ | Trùng khớp với ID của bài viết (`articles.id`) |
| `content` | `string` | ✅ | Nội dung Markdown |
| `playgroundBlocks` | `array<map>`| ✅ | Metadata config cho các Interactive Model nhúng |

### 2.6. `models` (Mô hình AI)
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ | Document ID |
| `name` | `string` | ✅ | Tên model |
| `description` | `string` | ✅ | Mô tả mô hình |
| `taskType` | `string` | ✅ | Loại tác vụ (vd: object_detection) |
| `fileUrl` | `string` | ✅ | R2 public URL tải file `.tflite` |
| `fileSizeBytes` | `number` | ✅ | Dung lượng file byte |
| `version` | `string` | ✅ | Phiên bản |
| `format` | `string` | ✅ | Định dạng (vd: litert) |
| `defaultConfig` | `map` | ✅ | Tham số mặc định (threshold, inputSize) |
| `createdAt` | `number` | ✅ | Thời điểm tạo |
| `updatedAt` | `number` | ✅ | Thời điểm cập nhật cuối |

---

## 3. Cosmos Game Domain (Presentation)

Đây là tầng UI/UX. Chữ tín "Rẻ & Nhanh" đặt lên hàng đầu. Một bản đồ có 100 ngôi sao cũng chỉ tốn **1 read** thay vì 100 reads.

### 3.1. `cosmos_maps` (Cấu hình bản đồ không gian)
Document ID bắt buộc trùng với `topicId` (đối với Chủ đề). Riêng với loại `rogue_anomalies`, bản đồ chứa các bài viết tự do (`topicId = null`) nên ID của bản đồ là độc lập (ví dụ: `"papers"`). Ktor tự động đồng bộ (sync) dữ liệu từ `articles` sang đây khi có thay đổi.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ | Map 1:1 với `topics` (trừ `rogue_anomalies`) |
| `mapType` | `string` | ✅ | Loại bản đồ: `"topic"`, `"rogue_anomalies"` |
| `theme` | `string` | ✅ | Theme đang dùng, vd: `"cosmos"`, `"nebula"` |
| `nodes` | `array<map>` | ✅ | Mảng chứa toàn bộ các ngôi sao (bài học) trên bản đồ |
| `nodes[].articleId` | `string` | ✅ | ID bài viết tương ứng |
| `nodes[].title` | `string` | ✅ | Tiêu đề (Denormalized từ `articles` để tránh read phụ) |
| `nodes[].celestialType` | `string` | ✅ | Loại sao: `"star"`, `"binary_star"`, `"anomaly"`, `"nebula"`, `"black_hole"` |
| `nodes[].x` | `number` | ✅ | Tọa độ X trên bản đồ |
| `nodes[].y` | `number` | ✅ | Tọa độ Y trên bản đồ |
| `nodes[].connections` | `array<string>`| ✅ | Mảng các `articleId` mà sao này nối tới (để vẽ tia sáng) |

### 3.2. `user_progress` (Tiến trình giải mã)
Document ID là `{userId}`. Gộp toàn bộ tiến trình của 1 user trên hệ thống vào 1 document duy nhất để tiết kiệm số lần đọc Firestore.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | ✅ | `userId` |
| `userId` | `string` | ✅ | ID người dùng |
| `completedArticleIds`| `array<string>`| ✅ | Danh sách ID các bài viết đã hoàn thành |
| `currentStreak` | `number` | ✅ | Số ngày chuỗi liên tiếp hiện tại |
| `longestStreak` | `number` | ✅ | Kỷ lục chuỗi dài nhất |
| `activeDates` | `array<string>`| ✅ | Mảng các ngày đã hoạt động (Format: YYYY-MM-DD theo local timezone) |
| `lastActive` | `number` | ✅ | Timestamp (Long) lần cuối hoạt động |

### ProgressSummary (Response Model)

Đây là response model (không lưu trên Firestore), được tính toán realtime từ `user_progress` + `articles`.

| Field | Type | Description |
|-------|------|-------------|
| topics | Map<String, CategoryProgress> | Tiến độ theo từng topic ID |
| standalone | Map<String, String> | Trạng thái từng standalone article (`decoded`/`unread`) |

### CategoryProgress (Response Model)

| Field | Type | Description |
|-------|------|-------------|
| total | Int | Tổng số articles trong category |
| completed | Int | Số articles đã hoàn thành (decoded) |


---

## 4. Phân tích chi phí (Read Cost)

Khi người dùng mở ứng dụng và tải một Bản đồ Sao:
1. Fetch `cosmos_maps/{mapId}` -> **1 Read**. (Lấy toàn bộ cấu trúc bản đồ, vị trí, tên bài học).
2. Fetch `user_progress/{userId}` -> **1 Read**. (Lấy mảng ID đã học để tính toán trạng thái sương mù/mở khóa của bản đồ).

**Tổng chi phí: Tối đa 2 Reads / user / map load.** Bất kể bản đồ lớn cỡ nào. Kiến trúc này giải quyết triệt để vấn đề N+1 Query.
