# Luồng người dùng — Sequoia (The Neural Cosmos)

> Tài liệu mô tả chi tiết các luồng tương tác chính của người dùng, lấy UI "The Neural Cosmos" làm chủ đạo. Tuy nhiên, API ngầm bên dưới vẫn giao tiếp với các hệ thống giáo trình, bài viết cốt lõi.
> Cập nhật lần cuối: 2026-07-20

---

## 1. Luồng Khám phá Vũ trụ (Thay cho Duyệt Giáo trình)

```mermaid
flowchart TD
    A["🌌 Màn hình chính (Vũ trụ tối)"] --> B["Khám phá Dải ngân hà (Sectors) / Tinh vân (Topics)"]
    B --> C["Ktor API: GET /api/v1/textbooks & /api/v1/topics"]
    C --> D["Chọn Sector hoặc Nebula<br/>(vd: Sector: MML)"]
    D --> E["Load Bản đồ Sao<br/>(Galaxy Map)"]
    
    E --> F["Ktor API: GET /api/v1/cosmos/maps/{mapId}<br/>(Tốn 1 Read)"]
    E --> G["Ktor API: GET /api/v1/cosmos/progress/{mapId}<br/>(Tốn 1 Read)"]
    
    F --> H["Client vẽ bản đồ: Các chòm sao, tọa độ, tia sáng"]
    G --> H
    
    H --> I["Hiển thị Sương mù (Fog of War)"]
    I --> J["Ngôi sao 'locked' bị ẩn mờ<br/>Ngôi sao 'decoding' nhấp nháy<br/>Ngôi sao 'decoded' phát sáng"]
    
    J --> K["Click vào ngôi sao đang nhấp nháy (decoding)"]
    K --> L["Mở Datapad (Đọc nội dung bài viết)"]
    L --> M["Ktor API: GET /api/v1/articles/{articleId}"]
```

**Trải nghiệm mong đợi:**
- Không có cảm giác "đang đọc sách". Người dùng đang là nhà thám hiểm.
- Sương mù bao phủ các bài học (ngôi sao) chưa được mở khóa.
- Bản đồ load ngay lập tức nhờ kiến trúc 2-reads.

---

## 2. Luồng Giải mã Tín hiệu (Thay cho Playground)

Khi người dùng mở một bài viết (Datapad) và gặp một khối Playground (Signal Tuner).

```mermaid
flowchart TD
    A["📝 Đang đọc Datapad (Bài viết)"] --> B{"Gặp khối Signal Tuner<br/>(Playground)"}
    
    B --> C["Giao diện Tuner hiện lên:<br/>'Phát hiện sóng AI bí ẩn'"]
    C --> D["Tải AI Model từ Cloudflare R2<br/>(LiteRT tflite file)"]
    D --> E["Cung cấp dữ liệu đầu vào<br/>(Camera / Hình ảnh)"]
    
    E --> F["Bắt đầu quá trình Giải mã (Inference)"]
    F --> G["Hiển thị dữ liệu:<br/>- Bounding Boxes (Tín hiệu)<br/>- Confidence (Độ nhiễu)<br/>- Inference Time (Độ trễ)"]
    
    G --> H["Điều chỉnh Tần số (Threshold Slider)"]
    H --> I["Màn hình cập nhật Real-time"]
    I --> J["Hoàn thành giải mã?"]
    
    J -->|"Có"| K["Đánh dấu hoàn thành bài học<br/>POST /api/v1/cosmos/progress"]
    K --> L["Quay lại Galaxy Map"]
    L --> M["Ngôi sao này rực sáng.<br/>Tia sáng truyền tới ngôi sao tiếp theo.<br/>Sương mù tan đi."]
```

**Khác biệt UX:**
- Threshold slider không gọi là "Threshold", mà gọi là "Bộ tinh chỉnh tần số / Noise Filter".
- Kết quả không gọi là "Bounding box", mà gọi là "Vùng tín hiệu".

---

## 3. Luồng Tìm kiếm (Quét Tín hiệu)

```mermaid
flowchart TD
    A["📡 Nhấn vào Radar (Search)"] --> B["Nhập từ khóa (Frequency)"]
    B --> C["Ktor gọi Full-text Search<br/>GET /api/v1/articles/search"]
    C --> D{"Có kết quả?"}
    
    D -->|"Không"| E["'Không bắt được tín hiệu phù hợp'"]
    D -->|"Có"| F["Hiển thị danh sách tọa độ (Kết quả)"]
    
    F --> G["Click vào một kết quả"]
    G --> H["Bay (Fly-to animation) đến ngôi sao đó trên Galaxy Map"]
    H --> I["Mở Datapad"]
```

---

## 4. Xử lý Edge Cases trong môi trường Cosmos

| Tình huống | Trạng thái UI theo Theme | Lỗi kỹ thuật ngầm hiểu |
| --- | --- | --- |
| Mất mạng | "Mất kết nối với Bộ Chỉ Huy. Khởi động chế độ sinh tồn (Offline Mode)." | No Internet Connection. Dùng cached data. |
| Model tải thất bại | "Bão từ trường cản trở việc tải AI core. Đang thử lại..." | R2 download failed hoặc timeout. |
| Camera từ chối quyền | "Cảm biến quang học (Camera) đang bị khóa. Hãy mở khóa trong Settings." | Permission Denied. |
| Token hết hạn | "Phiên bản Datapad đã cũ. Đang tái đồng bộ tín hiệu nhận dạng..." | JWT Expired, auto refresh token. |
