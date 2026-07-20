# Master Plan: Chuẩn bị Dự án Sequoia

Tài liệu chuẩn bị dự án dành cho một lập trình viên độc lập, xây dựng hệ thống gồm ứng dụng Android, ứng dụng Web và backend Ktor, tích hợp AI on-device.

---

## Giai đoạn 1: Tài liệu sản phẩm

Nguyên tắc: nội dung ngắn gọn, không đi sâu vào tiểu tiết. Mỗi mục giới hạn trong 1-2 trang.

### Product Requirements Document (PRD) rút gọn

**Tầm nhìn sản phẩm:** Nền tảng học AI/ML có cấu trúc theo giáo trình, kết hợp bài viết chuyên sâu với Model Playground nhúng trực tiếp trong nội dung, cho phép chạy mô hình trên thiết bị người dùng mà không cần server xử lý AI.

**Tính năng bắt buộc cho bản MVP:**

- Hệ thống nội dung linh hoạt với hai cách tổ chức song song:
  - Theo giáo trình: mỗi giáo trình (VD: Mathematics for Machine Learning, Artificial Intelligence: A Modern Approach) được chia thành các chương, mỗi chương chứa nhiều bài viết.
  - Theo chủ đề độc lập: các bài viết không gắn với giáo trình nào, được nhóm theo chủ đề tự do (VD: Computer Vision, NLP, Optimization). Người dùng có thể duyệt theo giáo trình, theo chủ đề, hoặc tìm kiếm chung.
- Bài viết có playground nhúng bên trong: bài viết không chỉ là văn bản, mà có thể chứa các khối playground tương tác tại vị trí phù hợp trong nội dung, giúp người đọc thực hành ngay khi đang học lý thuyết.
- Render công thức toán học: hỗ trợ LaTeX/KaTeX trong nội dung bài viết. Bắt buộc cho các giáo trình nặng toán như MML. Ảnh hưởng trực tiếp đến cách lưu trữ và render nội dung.
- Code blocks với syntax highlighting: bài viết AI/ML chứa code Python, cần hiển thị đẹp với syntax highlighting và nút copy.
- Tìm kiếm full-text: tìm kiếm xuyên suốt bài viết, giáo trình, chủ đề. Cần thiết kế cách index dữ liệu phù hợp vì Firestore không hỗ trợ full-text search natively.
- Model Playground có tính giáo dục: hiển thị confidence score kèm giải thích, cho phép điều chỉnh threshold để quan sát tradeoff precision/recall, hiển thị inference time và model size để hiểu tradeoff performance/accuracy. MVP hỗ trợ mô hình YOLO ở định dạng LiteRT, chạy inference cục bộ bằng camera hoặc ảnh tải lên.
- Đăng ký và đăng nhập tài khoản.
- Dark mode.

**Tính năng triển khai sau — ưu tiên gần (ảnh hưởng kiến trúc):**

- Admin CMS: giao diện quản trị riêng để tạo, sửa, xóa bài viết, quản lý giáo trình và chủ đề, thay vì thao tác trực tiếp trên Firebase Console.
- Bookmark / đánh dấu bài viết: lưu bài để đọc sau.
- Tiến độ đọc: theo dõi đang đọc tới đâu trong một giáo trình, đánh dấu chương đã hoàn thành.
- Offline support (đặc biệt trên Android): đọc bài viết và chạy model khi không có mạng, đồng bộ khi có kết nối trở lại.

**Tính năng triển khai sau — ưu tiên xa:**

- Glossary / Từ điển thuật ngữ AI/ML: cross-link từ thuật ngữ trong bài viết tới định nghĩa, giúp người mới không bị lost.
- Bình luận / Thảo luận dưới bài viết: trao đổi giữa người học.
- Hỗ trợ thêm nhiều loại mô hình: image classification, pose detection, text embedding — mỗi model đi kèm bài viết giải thích.
- So sánh model trực tiếp: chạy hai model song song trên cùng input, so sánh kết quả và hiệu năng.
- Lưu lịch sử các lần chạy mô hình.
- Thống kê tiến độ học tập theo giáo trình.
- Model Playground cho Gemma.

### Luồng người dùng (The Neural Cosmos Flow)

Luồng duyệt học liệu: Người dùng truy cập ứng dụng và được chào đón bởi **Bản đồ Vũ trụ (Galaxy Map)**.
- Họ chọn một Vùng không gian (Sector) tương ứng với giáo trình muốn học (VD: Foundation Sector / MML).
- Họ quan sát các Chòm sao (Constellations - tương ứng với các Chương) và thấy các Ngôi sao (Celestial Objects - tương ứng với Bài viết).
- Các ngôi sao chưa học bị che bởi sương mù. Người dùng click vào một Ngôi sao đang phát tín hiệu (Decoding) để mở giao diện bài học (Astronomer's Log / Datapad).
- Đọc lý thuyết, cuộn đến phần **Signal Tuner (Playground nhúng)**, chạy thử mô hình (cấp quyền camera, kéo threshold).
- Hoàn thành bài học, tín hiệu báo "DECODED", ngôi sao trên bản đồ bùng sáng và mở khóa đường đi tới ngôi sao tiếp theo.

Luồng upload: Người dùng đã đăng nhập tải ảnh cá nhân lên hệ thống (ví dụ: ảnh vệ tinh hoặc ảnh để phân tích qua Signal Tuner). Ứng dụng gửi yêu cầu kèm token xác thực tới backend Ktor, Ktor xác minh token và trả về presigned URL có thời hạn ngắn cho Cloudflare R2, ứng dụng dùng URL đó để tải file trực tiếp lên R2.

Các luồng này sẽ được bám sát theo thiết kế Blueprint `theme_cosmos.html` vừa được tạo.

### Lộ trình phát triển

Chia nhỏ theo mốc thời gian cụ thể. Ví dụ:

- Tuần 1-2: cấu hình Firebase, xây dựng backend Ktor với các endpoint cơ bản, thiết lập dự án Android và Web.
- Tuần 3: xây dựng giao diện Web và Android, kết nối với API backend.
- Tuần 4: tích hợp LiteRT và mô hình YOLO.
- Tuần 5: kiểm thử và triển khai.

---

## Giai đoạn 2: Thiết kế kỹ thuật

Nguyên tắc: chuẩn bị đầy đủ để các thành phần Web, Android, backend và AI tương thích với nhau khi tích hợp.

### Kiến trúc hệ thống

**Phía client:**

- Ứng dụng Web xây dựng bằng React hoặc Next.js, tích hợp thư viện LiteRT dành cho web để chạy mô hình AI trực tiếp trên trình duyệt.
- Ứng dụng Android xây dựng bằng Kotlin và Jetpack Compose, tích hợp thư viện LiteRT dành cho Android để chạy mô hình AI trên thiết bị, tận dụng khả năng tăng tốc phần cứng của GPU và NPU.

**Phía backend:** Sử dụng Ktor, ngôn ngữ Kotlin, đóng vai trò API Gateway tập trung toàn bộ logic nghiệp vụ. Ktor xác minh token Firebase Authentication, xử lý phân quyền, và là nơi duy nhất chứa business logic — đảm bảo Web và Android không phải duplicate logic. Ktor cũng chịu trách nhiệm tạo presigned URL khi client cần upload tệp lên Cloudflare R2.

**Cơ sở dữ liệu và xác thực:** Sử dụng Firebase. Firestore lưu trữ dữ liệu người dùng và bài viết. Firebase Authentication xử lý đăng nhập. Client gửi token xác thực cho Ktor, Ktor xác minh và thao tác Firestore thay mặt client.

**Kiểm soát truy cập dữ liệu:** Ktor là lớp bảo vệ chính, xử lý toàn bộ logic phân quyền trước khi đọc/ghi Firestore. Firestore Security Rules vẫn được cấu hình như lớp phòng thủ thứ hai (defense-in-depth), đảm bảo ngay cả khi backend có lỗi logic, dữ liệu vẫn không bị truy cập trái phép.

**Lưu trữ tệp:** Sử dụng Cloudflare R2 để lưu trữ hình ảnh của blog và các tệp mô hình định dạng LiteRT.

- Đối với việc tải tệp xuống, ví dụ tải mô hình AI: tệp được cấu hình công khai trên R2, client lấy đường dẫn từ API backend và tải trực tiếp từ R2, không đi qua backend để tránh tạo bottleneck băng thông.
- Đối với việc tải tệp lên, ví dụ người dùng tải ảnh cá nhân: client gửi yêu cầu tới Ktor, Ktor xác minh quyền và tạo presigned URL có thời hạn ngắn, client dùng URL đó để tải file trực tiếp lên R2.

### API Contract

Sử dụng chuẩn OpenAPI, tận dụng plugin sinh tài liệu tự động có sẵn trong Ktor. Toàn bộ business logic nằm ở backend, client chỉ gọi API — tránh duplicate logic giữa Web và Android. Cần định nghĩa rõ các endpoint, ví dụ:

- Endpoint lấy danh sách giáo trình.
- Endpoint lấy danh sách chương và bài viết theo giáo trình.
- Endpoint lấy danh sách chủ đề độc lập và bài viết theo chủ đề.
- Endpoint lấy nội dung bài viết kèm cấu hình playground nhúng.
- Endpoint lấy thông tin và đường dẫn tải mô hình AI theo mã định danh.
- Endpoint tạo presigned URL để upload tệp lên Cloudflare R2.

### Thiết kế dữ liệu

Thiết kế các collection trong Firestore, ví dụ:

- Collection lưu thông tin người dùng.
- Collection lưu danh sách giáo trình, bao gồm tên sách, tác giả, mô tả, và ảnh bìa.
- Collection lưu chương, liên kết với giáo trình cha, bao gồm tiêu đề, thứ tự sắp xếp, và mô tả ngắn.
- Collection lưu chủ đề độc lập, bao gồm tên chủ đề, mô tả, và icon hoặc ảnh minh họa.
- Collection lưu nội dung bài viết, có thể liên kết với chương của giáo trình, hoặc chủ đề độc lập, hoặc cả hai. Bao gồm nội dung bài viết và danh sách các khối playground nhúng kèm vị trí trong bài.
- Collection lưu cấu hình mô hình AI, bao gồm đường dẫn tệp trên Cloudflare R2, kích thước tệp, phiên bản, tác vụ mà mô hình hỗ trợ, và các tham số mặc định cho playground (threshold, input size).

### Tài liệu README

Khởi tạo ngay khi tạo repository. Nội dung cần bao gồm hướng dẫn cấu hình biến môi trường cho backend Ktor, hướng dẫn cấu hình Firebase, nội dung Firestore Security Rules, hướng dẫn chuyển đổi mô hình YOLO sang định dạng LiteRT, và cách thiết lập môi trường phát triển.

---

## Giai đoạn 3: Tiêu chuẩn code và quy trình làm việc

Nguyên tắc: duy trì kỷ luật trong quy trình làm việc, kể cả khi phát triển một mình, để tránh code trở nên khó bảo trì sau vài tháng.

### Quy ước viết code

- Đối với Android và Ktor: tuân thủ Kotlin Coding Conventions. Android Studio và IntelliJ IDEA hỗ trợ định dạng code tự động theo chuẩn này.
- Đối với Web: sử dụng ESLint kết hợp Prettier.

### Quy trình Git

- Nhánh main chỉ chứa code ở trạng thái production.
- Nhánh tính năng đặt tên theo cấu trúc feature/ten-tinh-nang-bang-tieng-anh. Ví dụ: feature/integrate-yolo-litert, feature/blog-api.
- Sau khi hoàn thành một nhánh tính năng, tạo Pull Request, tự rà soát lại thay đổi, sau đó mới merge vào nhánh main.
- Thông điệp commit tuân theo chuẩn Conventional Commits. Ví dụ: feat: add LiteRT inference, fix: camera crash on Android, docs: update README.

### Quản lý công việc

Sử dụng GitHub Projects, dạng bảng Kanban, tích hợp trực tiếp với GitHub Issues để theo dõi các tính năng cần triển khai.

---

## Giai đoạn 4: Môi trường vận hành và bảo mật

Nguyên tắc: tách biệt rõ ràng giữa môi trường phát triển và môi trường production để tránh làm hỏng dữ liệu thật.

### Môi trường

Tạo hai project Firebase riêng biệt: một project dùng để phát triển và kiểm thử, một project chỉ sử dụng khi ra mắt chính thức. Backend Ktor cũng cần cấu hình hai môi trường riêng, trỏ tới Firebase project tương ứng.

### Bảo mật

- Toàn bộ khóa API của Firebase và thông tin xác thực của Cloudflare R2 nằm ở backend Ktor, lưu trong file cấu hình môi trường riêng, không lưu trực tiếp trong mã nguồn. Client không giữ bất kỳ secret nào ngoài Firebase config công khai.
- File cấu hình môi trường và file chứa đường dẫn SDK cục bộ phải được thêm vào gitignore trước lần commit đầu tiên.
- Firestore Security Rules vẫn cần được cấu hình như lớp phòng thủ thứ hai, phòng trường hợp backend bị bypass hoặc có lỗi logic.
- Nếu sử dụng GitHub Actions để tự động hóa việc build và triển khai backend Ktor, cấu hình thông tin nhạy cảm thông qua GitHub Secrets.

---

## Checklist khởi động dự án

Hoàn thành các mục sau trước khi bắt đầu viết code:

- [ ] Hoàn thành PRD rút gọn, xác định rõ tính năng cốt lõi, loại bỏ các tính năng chưa cần thiết.
- [ ] Xuất thành công một mô hình AI mẫu sang định dạng LiteRT và kiểm thử chạy được bằng script Python cục bộ.
- [ ] Vẽ sơ đồ kiến trúc hệ thống, thể hiện luồng dữ liệu giữa Client, Ktor, Firebase và Cloudflare R2.
- [ ] Viết bản nháp đầu tiên của Firestore Security Rules (lớp phòng thủ thứ hai bên cạnh Ktor).
- [ ] Khởi tạo project Ktor rỗng, xác nhận build và chạy local thành công.
- [ ] Tạo repository trên GitHub, khởi tạo file README và cấu hình gitignore đầy đủ.
- [ ] Tạo bảng Kanban trên GitHub Projects, liệt kê các công việc cho tuần đầu tiên.
- [ ] Tạo hai project Firebase riêng biệt cho môi trường phát triển và production, cùng một bucket Cloudflare R2 để lưu trữ hình ảnh và tệp mô hình.

Các tài liệu trên nhằm hỗ trợ quá trình phát triển, không nhằm tạo ra gánh nặng thủ tục. Nên dành khoảng một đến hai ngày để hoàn thành toàn bộ checklist, sau đó tập trung phần lớn thời gian vào việc phát triển các tính năng cốt lõi.
