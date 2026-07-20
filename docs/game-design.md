# Thiết kế Miền Trò chơi (Game Domain Design)

Tài liệu đặc tả kiến trúc và luồng dữ liệu cho Game Domain ("The Neural Cosmos").

## 1. Tổng quan kiến trúc Game Domain

Hệ thống Gamification được thiết kế dưới dạng một Interactive 2D Canvas (Bản đồ không gian), đóng vai trò là giao diện điều hướng chính (Navigation UI) thay thế cho dạng danh sách dọc truyền thống.

- **Vùng không gian (Sectors)**: Ánh xạ 1-1 với collection `textbooks`.
- **Chòm sao (Constellations)**: Ánh xạ 1-1 với collection `chapters`.
- **Thiên thể (Celestial Objects)**: Ánh xạ 1-1 với collection `articles`.
- **Sương mù (Fog of War)**: Trạng thái chưa mở khóa (Locked) của các Node được tính toán dựa trên dữ liệu `CosmosProgress`.

## 2. Cấu trúc Dữ liệu UI (Celestial Types)

| Thành phần UI | Tương quan Backend | Loại hiển thị | Logic xử lý |
| --- | --- | --- | --- |
| Cụm sao (Cluster) | `chapters` | Nhóm Node | Định tuyến tạo các chòm sao, nhóm tọa độ |
| Node cơ bản | `articles` (Lý thuyết) | Star | Thay đổi CSS/SVG sáng lên khi hoàn thành (Decoded) |
| Node phức hợp | `articles` (Thuật toán lớn) | Binary Star | Hiệu ứng quỹ đạo quay quanh (Animation) |
| Node thực hành | `articles` (Chứa Playground) | Nebula | Yêu cầu phải chạy LiteRT thành công để qua bài |
| Sự cố (Anomaly) | `articles` (Gỡ lỗi) | Black Hole | Trạng thái hiển thị cảnh báo (Warning state) |

## 3. Luồng xử lý Gamification (Game Loop)

Luồng tương tác vòng lặp của người dùng trên bản đồ:

1. **Khởi tạo dữ liệu**: Client tải Data Class `CosmosMap` (chứa array tọa độ các Node) và `CosmosProgress` (trạng thái mở khóa hiện tại).
2. **Hiển thị Fog of War**: Render SVG/CSS. Các Node có trạng thái `locked` bị che phủ (Opacity thấp, Disable pointer). Các Node `decoded` hoặc `decoding` sáng rõ.
3. **Thao tác Giải mã (Decoding)**: Người dùng chọn một Node trạng thái `decoding`. Giao diện chuyển sang màn hình bài học định dạng Terminal (Datapad UI).
4. **Xác thực (Verification)**: Hoàn thành bài đọc hoặc chạy Model Playground đạt Threshold. Client gửi request POST `/cosmos/progress/{textbookId}/decode`.
5. **Cập nhật (Illumination)**: Ktor Backend cập nhật Firestore. Client nhận response trạng thái `decoded`, kích hoạt hiệu ứng CSS mở đường nối (Light Beams) tới các Node liền kề.

## 4. Thiết kế Giao diện (UI/UX Specifications)

- **Mã màu hệ thống**: Dark Space Background (`#05050A`), Decoded State (`#00e5ff`), Decoding State (`#f39c12`), Anomaly State (`#9b59b6`).
- **Typography**: Cặp phông chữ kỹ thuật (Space Grotesk cho hệ thống UI, Inter cho nội dung bài đọc).
- **Render Engine**: Yêu cầu bắt buộc sử dụng cấu trúc HTML/CSS/SVG DOM rendering (chỉ dùng Absolute Positioning và Transform Scale/Translate) để vẽ bản đồ, tuyệt đối không dùng WebGL hay Three.js nhằm tối ưu hiệu năng trên thiết bị di động yếu.

## 5. Ràng buộc Kỹ thuật

- Việc tính toán tọa độ (x, y) của tất cả các Node phải được cố định tĩnh (Seeding) và lưu thẳng vào Firestore collection `cosmos_maps`. Không sử dụng thuật toán Force-Directed Graph tính toán tự động trên Client để tránh sai lệch bố cục.
- Cấu trúc Navigation phải lưu lại trạng thái (Pan, Zoom state) của Canvas vào Global Context hoặc Session Storage để khi người dùng quay lại từ bài học, bản đồ không bị Reset về gốc.
