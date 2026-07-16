# Luồng người dùng — Sequoia

> Tài liệu mô tả chi tiết các luồng tương tác chính của người dùng trên nền tảng Sequoia, bao gồm cả happy path và edge cases.

---

## 1. Luồng duyệt theo giáo trình

Người dùng học theo lộ trình có cấu trúc: Giáo trình → Chương → Bài viết.

```mermaid
flowchart TD
    A["🏠 Trang chủ"] --> B["📚 Danh sách giáo trình"]
    B --> C["Chọn giáo trình<br/>(vd: Mathematics for ML)"]
    C --> D["📖 Trang giáo trình<br/>Mô tả + Danh sách chương"]
    D --> E["Chọn chương<br/>(vd: Chương 3 — Linear Algebra)"]
    E --> F["📄 Danh sách bài viết trong chương"]
    F --> G["Chọn bài viết<br/>(vd: Eigenvalues & Eigenvectors)"]
    G --> H["📝 Đọc bài viết"]
    H --> I{"Bài viết có<br/>playground nhúng?"}
    
    I -->|"Không"| J["Tiếp tục đọc /<br/>chuyển bài tiếp theo"]
    I -->|"Có"| K["🧪 Model Playground<br/>xuất hiện trong nội dung"]
    K --> L["Nhấn 'Chạy thử'"]
    L --> M["Xem kết quả inference<br/>(bounding boxes, confidence)"]
    M --> N["Điều chỉnh tham số<br/>(threshold, input khác)"]
    N --> M
    M --> J

    J --> O{"Còn bài tiếp<br/>trong chương?"}
    O -->|"Có"| F
    O -->|"Không"| P{"Còn chương tiếp<br/>trong giáo trình?"}
    P -->|"Có"| D
    P -->|"Không"| Q["🎉 Hoàn thành giáo trình"]

    style A fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style K fill:#22c55e,stroke:#15803d,color:#fff
    style Q fill:#f59e0b,stroke:#d97706,color:#fff
```

**Trải nghiệm mong đợi:**

- Người dùng thấy rõ **vị trí hiện tại** trong giáo trình (breadcrumb: Giáo trình > Chương > Bài viết).
- Bài viết có **nút điều hướng** (Bài trước / Bài tiếp) ở cuối trang.
- Playground được **nhúng tự nhiên** trong nội dung bài viết, tại vị trí liên quan đến lý thuyết đang trình bày.
- *(Post-MVP)* Hiển thị **tiến độ đọc** — bài nào đã đọc, chương nào đã hoàn thành.

---

## 2. Luồng duyệt theo chủ đề

Người dùng khám phá theo sở thích, không cần theo lộ trình cố định.

```mermaid
flowchart TD
    A["🏠 Trang chủ"] --> B["🏷️ Danh sách chủ đề"]
    B --> C["Chọn chủ đề<br/>(vd: Computer Vision)"]
    C --> D["📋 Trang chủ đề<br/>Mô tả + Danh sách bài viết"]
    D --> E["Chọn bài viết<br/>(vd: Object Detection Explained)"]
    E --> F["📝 Đọc bài viết"]
    F --> G{"Bài viết cũng thuộc<br/>một giáo trình?"}
    
    G -->|"Có"| H["Hiển thị link:<br/>'Bài này nằm trong Giáo trình X,<br/>Chương Y'"]
    H --> I["Có thể chuyển sang<br/>đọc theo lộ trình giáo trình"]
    G -->|"Không"| J["Bài viết độc lập"]

    F --> K["Xem bài viết liên quan<br/>(cùng chủ đề)"]
    K --> D

    style A fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style C fill:#a855f7,stroke:#7c3aed,color:#fff
```

**Ghi chú thiết kế:**

- Một bài viết có thể **thuộc cả giáo trình lẫn chủ đề** — ví dụ bài "Convolution" vừa thuộc chủ đề "Computer Vision" vừa là bài trong giáo trình "Deep Learning".
- Khi bài viết thuộc giáo trình, hiển thị **banner nhỏ** gợi ý người dùng có thể đọc theo lộ trình.
- Danh sách bài trong chủ đề **không có thứ tự bắt buộc** — khác với giáo trình.

---

## 3. Luồng tìm kiếm

```mermaid
flowchart TD
    A["🔍 Nhấn vào Search bar<br/>(hoặc phím tắt Ctrl+K)"] --> B["Nhập keyword<br/>(vd: 'gradient descent')"]
    B --> C["Gửi query tới API<br/>GET /api/search?q=gradient+descent"]
    C --> D["Ktor thực hiện full-text search<br/>trên Firestore"]
    D --> E{"Có kết quả?"}

    E -->|"Không"| F["Hiển thị: 'Không tìm thấy kết quả'<br/>+ Gợi ý keyword khác"]
    E -->|"Có"| G["Hiển thị kết quả<br/>nhóm theo loại"]

    G --> H["📚 Giáo trình<br/>(khớp tên/mô tả)"]
    G --> I["🏷️ Chủ đề<br/>(khớp tên/mô tả)"]
    G --> J["📝 Bài viết<br/>(khớp tiêu đề/nội dung)"]

    H --> K["Chọn giáo trình"]
    I --> L["Chọn chủ đề"]
    J --> M["Chọn bài viết"]

    K --> N["Trang giáo trình"]
    L --> O["Trang chủ đề"]
    M --> P["Trang bài viết<br/>(highlight keyword)"]

    style A fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style G fill:#22c55e,stroke:#15803d,color:#fff
```

**Chi tiết kỹ thuật:**

| Đặc điểm | Mô tả |
| ----------- | ------- |
| **Phạm vi tìm kiếm** | Tiêu đề bài viết, nội dung bài viết (text), tên giáo trình, tên chủ đề |
| **Thuật toán** | Full-text search qua Firestore (hoặc index bên ngoài nếu cần mở rộng) |
| **Debounce** | Client debounce 300ms trước khi gửi request, tránh gọi API quá nhiều |
| **Highlight** | Keyword được highlight trong tiêu đề và đoạn trích kết quả |
| **Phân trang** | Hiển thị tối đa 20 kết quả mỗi trang, hỗ trợ load more |

---

## 4. Luồng playground

Đây là luồng phức tạp nhất — bao gồm tải model, chọn input, chạy inference và hiển thị kết quả giáo dục.

```mermaid
flowchart TD
    A["🧪 Nhấn 'Chạy thử'<br/>trong playground"] --> B{"Model đã được<br/>cache trên thiết bị?"}

    B -->|"Đã cache"| C["Kiểm tra version<br/>với server"]
    B -->|"Chưa cache"| D["Hiển thị dialog:<br/>'Cần tải model (6MB)'"]

    C --> C1{"Version mới<br/>hơn trên server?"}
    C1 -->|"Không"| E["Load model<br/>từ cache"]
    C1 -->|"Có"| D

    D --> D1["Tải model từ R2"]
    D1 --> D2{"Tải thành công?"}
    D2 -->|"Không"| D3["❌ Hiển thị lỗi:<br/>'Không thể tải model.<br/>Kiểm tra kết nối mạng.'<br/>+ Nút 'Thử lại'"]
    D3 --> D1
    D2 -->|"Có"| D4["Verify checksum"]
    D4 --> D5["Lưu vào cache"]
    D5 --> E

    E --> F["Khởi tạo LiteRT interpreter<br/>(GPU/NPU delegate)"]
    F --> G["Chọn nguồn input"]

    G --> H["📷 Camera real-time"]
    G --> I["🖼️ Upload ảnh"]

    H --> H1{"Đã cấp quyền<br/>camera?"}
    H1 -->|"Chưa"| H2["Hiển thị dialog<br/>xin quyền camera"]
    H2 --> H3{"User cho phép?"}
    H3 -->|"Không"| H4["⚠️ Thông báo: 'Cần quyền camera<br/>để sử dụng tính năng này'<br/>+ Hướng dẫn bật lại trong Settings"]
    H3 -->|"Có"| H5["Mở camera preview"]
    H1 -->|"Đã cấp"| H5
    H5 --> J["Chạy inference<br/>liên tục trên camera frame"]

    I --> I1["Chọn ảnh từ gallery/file"]
    I1 --> J2["Chạy inference<br/>trên ảnh đã chọn"]

    J --> K["📊 Hiển thị kết quả"]
    J2 --> K

    K --> K1["Bounding boxes<br/>vẽ trên ảnh/camera"]
    K --> K2["Class labels<br/>+ Confidence %"]
    K --> K3["Inference time (ms)"]
    K --> K4["Số lượng objects<br/>phát hiện được"]

    K --> L["🎛️ Panel điều chỉnh"]
    L --> L1["Confidence threshold slider<br/>(0.0 → 1.0, mặc định 0.5)"]
    L --> L2["Hiển thị/ẩn labels"]
    L1 --> M["Áp dụng threshold mới"]
    M --> K

    K --> N["📘 Panel giáo dục"]
    N --> N1["Giải thích: Confidence score<br/>là gì? Tại sao quan trọng?"]
    N --> N2["Giải thích: Non-Maximum<br/>Suppression (NMS)"]
    N --> N3["Giải thích: Tại sao tăng<br/>threshold → ít detection hơn?"]

    style A fill:#22c55e,stroke:#15803d,color:#fff
    style K fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style N fill:#f59e0b,stroke:#d97706,color:#fff
    style D3 fill:#ef4444,stroke:#dc2626,color:#fff
    style H4 fill:#f97316,stroke:#ea580c,color:#fff
```

**Các tham số playground:**

| Tham số | Giá trị mặc định | Phạm vi | Mô tả |
| --------- | ------------------- | --------- | ------- |
| `confidenceThreshold` | 0.5 | 0.0 – 1.0 | Ngưỡng confidence tối thiểu để hiển thị detection |
| `iouThreshold` | 0.45 | 0.0 – 1.0 | Ngưỡng IoU cho Non-Maximum Suppression |
| `maxDetections` | 20 | 1 – 100 | Số lượng detection tối đa hiển thị |
| `showLabels` | true | true/false | Hiển thị class label trên bounding box |
| `showConfidence` | true | true/false | Hiển thị confidence % trên bounding box |

---

## 5. Luồng đăng ký / đăng nhập

```mermaid
flowchart TD
    A["👤 Nhấn 'Đăng nhập'"] --> B["Hiển thị Auth screen"]
    B --> C{"Chọn phương thức"}

    C -->|"Email/Password"| D["Tab Đăng nhập"]
    C -->|"Google"| E["Google Sign-In"]

    D --> D1{"Đã có tài khoản?"}
    D1 -->|"Có"| D2["Nhập email + password"]
    D1 -->|"Chưa"| D3["Chuyển sang tab Đăng ký"]
    D3 --> D4["Nhập email + password + xác nhận"]
    D4 --> D5["Firebase createUser"]
    D5 --> D6{"Thành công?"}
    D6 -->|"Không"| D7["Hiển thị lỗi:<br/>Email đã tồn tại /<br/>Password quá yếu"]
    D7 --> D4
    D6 -->|"Có"| F["Firebase trả về ID Token"]

    D2 --> D8["Firebase signIn"]
    D8 --> D9{"Thành công?"}
    D9 -->|"Không"| D10["Hiển thị lỗi:<br/>Sai email/password"]
    D10 --> D2
    D9 -->|"Có"| F

    E --> E1["Mở Google Sign-In popup/intent"]
    E1 --> E2{"User chọn tài khoản?"}
    E2 -->|"Hủy"| E3["Quay lại Auth screen"]
    E2 -->|"Chọn"| E4["Firebase signInWithCredential"]
    E4 --> F

    F --> G["Lưu token vào bộ nhớ<br/>(Android: EncryptedSharedPrefs<br/>Web: Memory + httpOnly cookie)"]
    G --> H["Kiểm tra user document<br/>trong Firestore"]
    H --> H1{"Document tồn tại?"}
    H1 -->|"Không (user mới)"| H2["Tạo user document<br/>(uid, email, displayName,<br/>createdAt)"]
    H1 -->|"Có"| I
    H2 --> I["Redirect về trang<br/>user đang xem trước đó"]

    style A fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style F fill:#22c55e,stroke:#15803d,color:#fff
    style I fill:#a855f7,stroke:#7c3aed,color:#fff
```

**Chính sách bảo mật token:**

| Platform | Lưu trữ token | Ghi chú |
| ---------- | --------------- | --------- |
| **Android** | EncryptedSharedPreferences | Mã hóa bằng Android Keystore, xóa khi logout |
| **Web** | In-memory (JS variable) | Không lưu vào localStorage để tránh XSS. Firebase SDK tự quản lý persistence qua IndexedDB |

---

## 6. Luồng upload ảnh

```mermaid
flowchart TD
    A["🖼️ Nhấn 'Upload ảnh'<br/>trong playground"] --> B["Mở file picker"]
    B --> C["Chọn file ảnh"]
    C --> D{"Validate phía client"}

    D --> D1["Kiểm tra file type<br/>(jpg, png)"]
    D --> D2["Kiểm tra file size<br/>(< 10MB)"]

    D1 -->|"Sai type"| D3["❌ 'Chỉ hỗ trợ ảnh JPG, PNG'"]
    D2 -->|"Quá lớn"| D4["❌ 'Ảnh phải nhỏ hơn 10MB'"]
    D3 --> B
    D4 --> B

    D1 -->|"OK"| E{"File size OK?"}
    D2 -->|"OK"| E
    E -->|"Cả hai OK"| F["Gửi request lấy presigned URL<br/>POST /api/uploads/presigned-url<br/>Authorization: Bearer token"]

    F --> G{"Ktor phản hồi?"}
    G -->|"401 Unauthorized"| H["Token hết hạn<br/>→ Refresh token<br/>→ Retry"]
    G -->|"429 Too Many Requests"| I["⚠️ 'Bạn upload quá nhiều.<br/>Vui lòng thử lại sau.'"]
    G -->|"200 OK"| J["Nhận presigned URL<br/>+ objectKey"]

    J --> K["Upload file trực tiếp lên R2<br/>PUT presignedUrl<br/>Content-Type: image/jpeg"]
    K --> K1["Hiển thị progress bar"]

    K1 --> L{"Upload thành công?"}
    L -->|"Không"| M["❌ 'Upload thất bại.<br/>Kiểm tra kết nối mạng.'<br/>+ Nút 'Thử lại'"]
    M --> K
    L -->|"Có"| N["Gửi xác nhận<br/>POST /api/uploads/confirm"]

    N --> O["Ktor lưu metadata<br/>vào Firestore"]
    O --> P["✅ Hiển thị ảnh đã upload<br/>trong playground"]
    P --> Q["Chạy inference<br/>trên ảnh này"]

    style A fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style P fill:#22c55e,stroke:#15803d,color:#fff
    style D3 fill:#ef4444,stroke:#dc2626,color:#fff
    style D4 fill:#ef4444,stroke:#dc2626,color:#fff
    style M fill:#ef4444,stroke:#dc2626,color:#fff
```

**Giới hạn upload:**

| Quy tắc | Giá trị |
| --------- | --------- |
| File types cho phép | `image/jpeg`, `image/png` |
| Kích thước tối đa | 10 MB |
| Rate limit | 10 uploads / phút / user |
| Presigned URL hết hạn | 15 phút |

---

## 7. Edge cases và xử lý lỗi

### 7.1. Offline / Mất kết nối

```mermaid
flowchart TD
    A["User đang sử dụng app"] --> B{"Mất kết nối mạng"}
    
    B --> C["Đọc bài viết"]
    B --> D["Playground"]
    B --> E["Tìm kiếm"]
    B --> F["Đăng nhập"]

    C --> C1{"Bài viết đã cache<br/>(Post-MVP)?"}
    C1 -->|"Có"| C2["Hiển thị từ cache<br/>(với banner 'Đang offline')"]
    C1 -->|"Chưa"| C3["❌ 'Không có kết nối mạng.<br/>Không thể tải bài viết.'"]

    D --> D1{"Model đã cache?"}
    D1 -->|"Có"| D2["✅ Chạy inference offline<br/>(chỉ với ảnh local,<br/>không upload)"]
    D1 -->|"Chưa"| D3["❌ 'Cần kết nối mạng<br/>để tải model lần đầu.'"]

    E --> E1["❌ 'Tìm kiếm cần kết nối mạng'"]

    F --> F1["❌ 'Đăng nhập cần kết nối mạng'<br/>Nếu đã đăng nhập trước đó:<br/>token có thể vẫn hợp lệ"]

    style B fill:#ef4444,stroke:#dc2626,color:#fff
    style D2 fill:#22c55e,stroke:#15803d,color:#fff
    style C2 fill:#f59e0b,stroke:#d97706,color:#fff
```

### 7.2. Model tải thất bại

```mermaid
flowchart TD
    A["Bắt đầu tải model"] --> B{"Lỗi xảy ra"}

    B -->|"Network error"| C["Hiển thị: 'Mất kết nối.<br/>Kiểm tra mạng và thử lại.'"]
    B -->|"Server error (5xx)"| D["Hiển thị: 'Server đang gặp sự cố.<br/>Vui lòng thử lại sau.'"]
    B -->|"File corrupted<br/>(checksum fail)"| E["Xóa file đã tải<br/>→ Thông báo: 'File bị lỗi,<br/>đang tải lại...'<br/>→ Tự động retry"]
    B -->|"Thiếu dung lượng"| F["Hiển thị: 'Không đủ bộ nhớ.<br/>Model cần 6MB.<br/>Giải phóng bộ nhớ và thử lại.'"]

    C --> G["Nút 'Thử lại'"]
    D --> G
    F --> G

    G --> H{"Retry lần thứ mấy?"}
    H -->|"<= 3"| A
    H -->|"> 3"| I["Hiển thị: 'Không thể tải model<br/>sau nhiều lần thử.<br/>Vui lòng quay lại sau.'"]

    E --> J{"Retry lần 2<br/>cũng fail?"}
    J -->|"Có"| I
    J -->|"Không"| K["✅ Tải thành công"]

    style B fill:#ef4444,stroke:#dc2626,color:#fff
    style K fill:#22c55e,stroke:#15803d,color:#fff
    style I fill:#6b7280,stroke:#4b5563,color:#fff
```

### 7.3. Camera bị từ chối quyền

```mermaid
flowchart TD
    A["User chọn Camera<br/>trong playground"] --> B{"Platform?"}

    B -->|"Android"| C{"Quyền camera<br/>hiện tại?"}
    B -->|"Web"| D{"Quyền camera<br/>hiện tại?"}

    C -->|"Chưa hỏi"| C1["Hiển thị rationale dialog:<br/>'Sequoia cần camera để chạy<br/>object detection real-time'"]
    C1 --> C2["System permission dialog"]
    C2 -->|"Cho phép"| OK["✅ Mở camera"]
    C2 -->|"Từ chối"| C3{"Từ chối vĩnh viễn<br/>(Don't ask again)?"}
    C3 -->|"Không"| C4["Lần sau mở sẽ hỏi lại"]
    C3 -->|"Có"| C5["Hiển thị hướng dẫn:<br/>'Vào Settings → Apps →<br/>Sequoia → Permissions →<br/>Bật Camera'<br/>+ Nút mở Settings"]

    C -->|"Đã từ chối vĩnh viễn"| C5
    C -->|"Đã cho phép"| OK

    D -->|"Chưa hỏi"| D1["Browser permission prompt"]
    D1 -->|"Allow"| OK
    D1 -->|"Block"| D2["Hiển thị hướng dẫn:<br/>'Nhấn icon 🔒 trên thanh địa chỉ<br/>→ Camera → Allow<br/>→ Reload trang'"]

    D -->|"Đã block"| D2
    D -->|"Đã allow"| OK

    OK --> E["Gợi ý: 'Bạn cũng có thể<br/>upload ảnh thay vì dùng camera'"]

    C4 --> F["Gợi ý dùng Upload ảnh<br/>thay thế"]
    C5 --> F
    D2 --> F

    style OK fill:#22c55e,stroke:#15803d,color:#fff
    style C5 fill:#f97316,stroke:#ea580c,color:#fff
    style D2 fill:#f97316,stroke:#ea580c,color:#fff
```

### 7.4. Token hết hạn

```mermaid
flowchart TD
    A["Client gửi request<br/>với expired token"] --> B["Ktor verify token"]
    B --> C["Firebase Admin SDK:<br/>Token expired"]
    C --> D["Ktor trả 401 Unauthorized<br/>+ error code: TOKEN_EXPIRED"]

    D --> E["Client nhận 401"]
    E --> F["Gọi Firebase SDK:<br/>getIdToken(forceRefresh=true)"]
    F --> G{"Refresh thành công?"}

    G -->|"Có"| H["Lưu token mới"]
    H --> I["Tự động retry request<br/>ban đầu với token mới"]
    I --> J["✅ Request thành công"]

    G -->|"Không (user bị disable,<br/>refresh token hết hạn)"| K["Xóa token cũ"]
    K --> L["Redirect về trang đăng nhập<br/>với message: 'Phiên đăng nhập<br/>đã hết hạn. Vui lòng<br/>đăng nhập lại.'"]

    style D fill:#ef4444,stroke:#dc2626,color:#fff
    style J fill:#22c55e,stroke:#15803d,color:#fff
    style L fill:#f59e0b,stroke:#d97706,color:#fff
```

**Cơ chế token refresh tự động:**

- Client cài đặt **HTTP interceptor** (Ktor Client trên Android, Axios interceptor trên Web).
- Khi nhận response 401 với error code `TOKEN_EXPIRED`, interceptor tự động:
  1. Gọi `getIdToken(forceRefresh = true)` để lấy token mới.
  2. Cập nhật header `Authorization` và retry request ban đầu.
  3. Nếu retry vẫn fail → redirect về trang đăng nhập.
- **Tối đa 1 lần retry** per request để tránh infinite loop.
- Nếu nhiều request cùng fail 401, chỉ **1 request gọi refresh**, các request khác chờ kết quả.

---

## Tổng hợp trạng thái UI

Bảng tổng hợp các trạng thái UI cần thiết kế cho mỗi màn hình:

| Màn hình | Loading | Empty | Error | Success | Offline |
| ---------- | --------- | ------- | ------- | --------- | --------- |
| Danh sách giáo trình | Skeleton loader | "Chưa có giáo trình nào" | "Không thể tải. Thử lại." | Hiển thị danh sách | Cache (Post-MVP) |
| Danh sách bài viết | Skeleton loader | "Chương này chưa có bài viết" | "Không thể tải. Thử lại." | Hiển thị danh sách | Cache (Post-MVP) |
| Đọc bài viết | Skeleton + shimmer | — | "Không thể tải bài viết." | Render content | Cache (Post-MVP) |
| Tìm kiếm | Spinner | "Không tìm thấy kết quả" | "Tìm kiếm thất bại." | Hiển thị kết quả | Không khả dụng |
| Playground | Loading model bar | — | "Không thể tải model." | Camera/ảnh + detections | Dùng cache model |
| Đăng nhập | Button spinner | — | "Sai email/mật khẩu." | Redirect | Không khả dụng |
| Upload ảnh | Progress bar % | — | "Upload thất bại." | Hiển thị ảnh | Không khả dụng |
