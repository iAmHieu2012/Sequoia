# API Contract — Sequoia (Ktor Backend)

> Tài liệu API chuẩn giao tiếp giữa Frontend (Web/Android) và Ktor Backend.
> Cập nhật lần cuối: 2026-07-20

---

## 1. Core Education Endpoints

Nhóm API thuần túy về giáo dục, có thể dùng chung cho cả CMS Admin và các ứng dụng vệ tinh.

### 1.1. `GET /api/v1/textbooks`
- Lấy danh sách giáo trình.
- Trả về mảng các `textbooks`. (Không có thông tin tọa độ hay sương mù).

### 1.2. `GET /api/v1/topics`
- Lấy danh sách chủ đề độc lập (Free Nebulas).
- Trả về mảng các `topics`.

### 1.3. `GET /api/v1/articles/:id`
- Lấy nội dung chi tiết bài viết (Datapad content).
- Trả về JSON chứa `title`, `content` (Markdown), và `playgroundBlocks`.

---

## 2. Cosmos Game Endpoints (Tối ưu Firestore)

Nhóm API phục vụ riêng cho UI "The Neural Cosmos". Được tối ưu để trả về cấu trúc phức tạp nhưng chỉ tốn 1 Firestore Read.

### 2.1. Lấy Bản đồ Sao (Galaxy Map)
**`GET /api/v1/cosmos/maps/:mapId`**

**Mô tả:** Trả về toàn bộ cấu trúc bản đồ của một Giáo trình hoặc Chủ đề (Sectors/Nebulas -> Ngôi sao, Tọa độ, Connections).

**Response (200 OK):**
```json
{
  "id": "mml-id",
  "mapType": "textbook",
  "theme": "cosmos",
  "nodes": [
    {
      "articleId": "vector-spaces",
      "title": "Vector Spaces",
      "celestialType": "star",
      "x": 150,
      "y": 300,
      "connections": ["matrix-decomp"]
    }
  ]
}
```
*(Ngầm định backend chỉ tốn 1 Read để fetch document `cosmos_maps/{mapId}`)*

### 2.2. Lấy Tiến trình (Fog of War)
**`GET /api/v1/cosmos/progress/:mapId`**

**Mô tả:** Trả về trạng thái mở khóa của user trên bản đồ. Cần truyền Bearer Token của Firebase Auth.

**Response (200 OK):**
```json
{
  "progressMap": {
    "vector-spaces": "decoded",
    "matrix-decomp": "decoding",
    "eigenvalues": "locked"
  }
}
```

### 2.3. Cập nhật Tiến trình (Mở khóa tín hiệu)
**`POST /api/v1/cosmos/progress/:mapId/decode`**

**Body:**
```json
{
  "articleId": "matrix-decomp"
}
```

**Mô tả:** Gọi khi người dùng giải mã thành công (chạy xong Signal Tuner). Backend sẽ đánh dấu bài này là `"decoded"` và mở khóa (`"decoding"`) cho bài tiếp theo dựa trên logic connections, sau đó lưu vào document `cosmos_progress`.

---

## 3. Models Endpoints

### 3.1. `GET /api/v1/models/:id`
- Lấy metadata và URL tải file `.tflite` từ Cloudflare R2 để nạp vào Signal Tuner.
