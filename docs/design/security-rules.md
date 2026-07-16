# Firestore Security Rules

Tài liệu này quy định các quy tắc bảo mật (Security Rules) cho cơ sở dữ liệu Firestore của dự án Sequoia.

## 1. Nguyên tắc: Defense-in-depth

Kiến trúc bảo mật của Sequoia dựa trên mô hình **Defense-in-depth (phòng thủ chiều sâu)**:

- **Lớp 1 (Ktor Backend):** Là chốt chặn chính. Mọi request từ client (Web/Android) phải đi qua Ktor. Ktor sẽ xác thực token, kiểm tra quyền truy cập, thực hiện business logic và chỉ khi hợp lệ mới tương tác với Firestore qua Admin SDK (vốn bypass mọi rules).
- **Lớp 2 (Firestore Security Rules):** Đóng vai trò lớp bảo vệ dự phòng. Nếu có lỗ hổng trên Ktor hoặc thông tin xác thực bị lộ dẫn đến việc truy cập trực tiếp vào Firestore từ bên ngoài, Security Rules sẽ đảm bảo dữ liệu vẫn an toàn và không bị thao tác trái phép.

## 2. Quy tắc cho từng collection

- `users`: Người dùng chỉ có quyền đọc và ghi vào document của chính mình (`request.auth.uid == resource.id`).
- `textbooks`: Bất kỳ ai cũng có thể đọc (public read), nhưng chỉ admin (kiểm tra qua custom claim `isAdmin`) mới được ghi/xóa/sửa.
- `chapters`: Ai cũng có thể đọc, chỉ admin mới có quyền ghi.
- `topics`: Ai cũng có thể đọc, chỉ admin mới có quyền ghi.
- `articles`: Chỉ cho phép đọc các bài viết đã xuất bản (`isPublished == true`), admin có thể đọc và ghi toàn bộ bài viết (kể cả bản nháp).
- `models`: Ai cũng có thể đọc thông tin cấu hình mô hình, chỉ admin mới có quyền ghi.

## 3. Code rules hoàn chỉnh

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // 4. Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() && request.auth.token.isAdmin == true;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Rules for users
    match /users/{userId} {
      allow read, write: if isOwner(userId) || isAdmin();
    }

    // Rules for textbooks
    match /textbooks/{textbookId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Rules for chapters
    match /chapters/{chapterId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Rules for topics
    match /topics/{topicId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Rules for articles
    match /articles/{articleId} {
      // Cho phép đọc nếu bài đã publish, hoặc user là admin
      allow read: if (resource.data.isPublished == true) || isAdmin();
      allow write: if isAdmin();
    }

    // Rules for models
    match /models/{modelId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Khóa mọi quyền truy cập mặc định cho các collection không định nghĩa
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 5. Hướng dẫn test

Để đảm bảo an toàn, các quy tắc bảo mật cần được kiểm tra kỹ lưỡng bằng **Firebase Emulator Suite** trước khi deploy.

1. Khởi động Emulator:

   ```bash
   firebase emulators:start --only firestore
   ```

2. Viết unit test (VD: dùng Jest và thư viện `@firebase/rules-unit-testing`):
   - Test kịch bản user thường cố gắng sửa bài viết (phải bị từ chối).
   - Test kịch bản đọc bài chưa publish (phải bị từ chối).
   - Test kịch bản admin thực hiện các thao tác (phải được phép).

## 6. Checklist review trước khi deploy

1. [ ] Mọi collection đều đã được định nghĩa rule?
2. [ ] Rule mặc định `match /{document=**}` đã được set là `false`?
3. [ ] Collection `users` đã kiểm tra chính xác ID của chủ sở hữu?
4. [ ] Quyền ghi (write) cho các nội dung công khai (bài viết, giáo trình) đã được giới hạn chỉ cho `isAdmin`?
5. [ ] Trường hợp đọc bài viết, đã kiểm tra flag `isPublished` chưa?
6. [ ] Custom claim `isAdmin` đã được cấu hình an toàn từ backend Ktor và không thể bị giả mạo từ client?
7. [ ] Đã chạy đủ coverage cho các Unit Test bảo mật trong Emulator?
8. [ ] Không có rule nào lạm dụng `allow read, write: if true` ngoài ý muốn?
9. [ ] Đã review việc đánh index cho các truy vấn có điều kiện (ví dụ `isPublished == true`)?
10. [ ] Đã test thử trên môi trường Staging/Dev trước khi áp dụng lên Production?
