# Quy ước Code và Quy trình Làm việc (Conventions)

Tài liệu này quy định các tiêu chuẩn về viết code, viết tài liệu trong code, quản lý nhánh và lịch sử commit của dự án Sequoia.

## 1. Quy ước Commit (Conventional Commits)

Toàn bộ commit message trong dự án phải tuân theo chuẩn [Conventional Commits](https://www.conventionalcommits.org/) và **BẮT BUỘC viết bằng Tiếng Anh**. Việc này giúp lịch sử git rõ ràng và hỗ trợ tạo Changelog tự động sau này.

**Cú pháp:**

```text
<type>[optional scope]: <description>

[optional body]
```

**Các `type` được phép sử dụng:**

- `feat`: Tính năng mới (tương đương với MINOR trong Semantic Versioning).
- `fix`: Sửa lỗi (tương đương với PATCH trong Semantic Versioning).
- `docs`: Cập nhật tài liệu (README, thư mục `docs/`).
- `style`: Định dạng code (khoảng trắng, dấu phẩy, format... không ảnh hưởng logic).
- `refactor`: Viết lại code nhưng không thêm tính năng mới hay sửa lỗi.
- `perf`: Tối ưu hiệu năng.
- `test`: Thêm hoặc sửa test cases.
- `chore`: Các tác vụ quản trị, cập nhật thư viện, cấu hình build.

**Ví dụ:**

- `feat(api): add endpoint to fetch textbook list`
- `fix(ui): fix crash on camera permission denial`
- `docs(api): update api-contract for upload flow`
- `chore: bump Next.js version to 16.x`

## 2. Quy ước đặt tên nhánh (Branch Naming)

Khi làm việc với các tính năng mới hoặc sửa lỗi, hãy tạo nhánh mới từ `main` thay vì commit trực tiếp.

**Cú pháp:** `<type>/<issue-id-or-short-desc>`

**Ví dụ:**

- `feat/yolo-litert-integration`
- `fix/camera-permission-crash`
- `docs/update-architecture`

## 3. Quy ước Comment Code (KDoc & JSDoc)

Code tự nó phải rõ ràng (Self-documenting code), chỉ comment **TẠI SAO (Why)** chứ không comment **CÁI GÌ (What)** (trừ khi logic quá phức tạp). Toàn bộ JSDoc **BẮT BUỘC phải viết bằng Tiếng Anh**. Tuy nhiên, đối với các public API, class và interface, bắt buộc phải dùng JSDoc (Web).

### 3.1. JSDoc/TSDoc (cho Web - Next.js/React/TypeScript)

Bắt buộc sử dụng JSDoc/TSDoc cho:

- Các React Hooks tùy chỉnh (Custom hooks).
- Các hàm Utility phức tạp.
- Các Service class (AdminService, UploadService).
- Các Supabase utility functions (createClient, supabaseAdmin).

**Ví dụ TSDoc:**

```typescript
/**
 * Custom hook to load and manage the state of the LiteRT model in the browser.
 *
 * @param modelUrl - URL of the model file fetched from CDN.
 * @returns The model state including model instance, loading state, and error.
 */
export function useLiteRTModel(modelUrl: string) {
    // ...
}
```

## 4. Quy ước Formatting Code

- **Web (React/Next.js/TypeScript):** Sử dụng **ESLint** (đã cấu hình sẵn với `eslint-config-next`). Khuyến nghị thiết lập format on save.
