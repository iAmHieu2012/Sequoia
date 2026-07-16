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

- `feat(core): add endpoint to fetch textbook list`
- `fix(android): fix crash on camera permission denial`
- `docs(api): update api-contract for upload flow`
- `chore: bump Kotlin version to 1.9.20`

## 2. Quy ước đặt tên nhánh (Branch Naming)

Khi làm việc với các tính năng mới hoặc sửa lỗi, hãy tạo nhánh mới từ `main` thay vì commit trực tiếp.

**Cú pháp:** `<type>/<issue-id-or-short-desc>`

**Ví dụ:**

- `feat/yolo-litert-integration`
- `fix/camera-permission-crash`
- `docs/update-architecture`

## 3. Quy ước Comment Code (KDoc & JSDoc)

Code tự nó phải rõ ràng (Self-documenting code), chỉ comment **TẠI SAO (Why)** chứ không comment **CÁI GÌ (What)** (trừ khi logic quá phức tạp). Toàn bộ KDoc và JSDoc **BẮT BUỘC phải viết bằng Tiếng Anh**. Tuy nhiên, đối với các public API, class và interface, bắt buộc phải dùng KDoc (Kotlin) và JSDoc (Web).

### 3.1. KDoc (cho Ktor và Android)

Bắt buộc sử dụng KDoc cho:

- Các Data Class/Model đại diện cho Entity.
- Các Interface của Repository/Service.
- Các hàm Public phức tạp.

**Ví dụ KDoc:**

```kotlin
/**
 * Manager for the LiteRT inference flow.
 * 
 * This class is responsible for loading the model, initializing the Interpreter,
 * and handling pre-processing/post-processing for the input image.
 *
 * @param modelPath Absolute path to the .tflite file.
 * @param useGpu Option to enable GPU delegate (Android only).
 * @throws IllegalArgumentException if the model file is not found.
 */
class LiteRTInferenceManager(
    private val modelPath: String,
    private val useGpu: Boolean = false
) {
    // ...
}
```

### 3.2. JSDoc (cho Web - Next.js/React)

Bắt buộc sử dụng JSDoc cho:

- Các React Hooks tùy chỉnh (Custom hooks).
- Các hàm Utility phức tạp.
- Định nghĩa Props của Component (nếu không dùng TypeScript cứng).

**Ví dụ JSDoc:**

```javascript
/**
 * Custom hook to load and manage the state of the LiteRT model in the browser.
 *
 * @param {string} modelUrl - URL of the model file fetched from R2.
 * @returns {{ model: any, isLoading: boolean, error: Error | null }} The model state.
 */
export function useLiteRTModel(modelUrl) {
    // ...
}
```

## 4. Quy ước Formatting Code

- **Kotlin (Ktor/Android):** Tuân thủ tiêu chuẩn định dạng của IntelliJ IDEA/Android Studio. Nên bật tính năng "Optimize imports on the fly" và "Reformat code" trước khi commit.
- **Web (React/Next.js):** Sử dụng **Prettier** kết hợp với **ESLint**. Khuyến nghị thiết lập Prettier chạy tự động khi lưu file (Format on save).
