# Kiến trúc hệ thống — Sequoia

> Tài liệu mô tả kiến trúc tổng thể, tech stack, các luồng dữ liệu chính và chiến lược bảo mật của nền tảng Sequoia.
> Cập nhật lần cuối: 2026-08-19

---

## 1. Sơ đồ kiến trúc tổng thể

```mermaid
graph TB
    subgraph Clients
        WEB["Web Client<br/>(React/Next.js + LiteRT Web SDK)"]
    end

    subgraph "Next.js Full-stack"
        FRONTEND["Next.js Frontend<br/>(SSR/CSR Pages)"]
        API["Next.js API Routes<br/>(/api/v1/* — Business Logic)"]
    end

    subgraph Firebase
        AUTH["Firebase Auth"]
    end

    subgraph Supabase
        POSTGRES["PostgreSQL Database"]
    end

    subgraph Storage
        CDN["Public CDN<br/>(jsDelivr / Hugging Face)"]
        CLOUDINARY["Cloudinary<br/>(Images)"]
    end

    WEB <--> FRONTEND

    WEB -->|"Login/Register"| AUTH

    API -->|"Verify ID token (firebase-admin)"| AUTH
    API <-->|"Read/Write Data (service_role)"| POSTGRES

    WEB -->|"Download Model (Public)"| CDN
    WEB -->|"Upload Image"| CLOUDINARY

    style WEB fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style FRONTEND fill:#8b5cf6,stroke:#6d28d9,color:#fff
    style API fill:#a855f7,stroke:#7c3aed,color:#fff
    style AUTH fill:#f59e0b,stroke:#d97706,color:#fff
    style POSTGRES fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style CDN fill:#f97316,stroke:#ea580c,color:#fff
    style CLOUDINARY fill:#f97316,stroke:#ea580c,color:#fff
```

**Nguyên tắc thiết kế chính:**

- **Next.js là trung tâm điều phối** — Web Frontend và API Routes cùng deploy trong một ứng dụng, giảm overhead vận hành.
- **AI inference chạy hoàn toàn on-device** — API không xử lý inference, chỉ cung cấp metadata và URL tải model.
- **Client tải model trực tiếp từ CDN** — API không proxy dữ liệu lớn qua server để giảm tải bandwidth và latency.
- **Firebase Auth là nguồn xác thực duy nhất** — client đăng nhập bằng Firebase, API kiểm tra Firebase ID token. Supabase chỉ làm database.

---

## 2. Tech stack chi tiết

### 2.1. Tổng quan theo component

| Component | Technology | Vai trò |
| ----------- | ----------- | --------- |
| **Web Frontend** | React / Next.js (App Router) | SSR/CSR cho giao diện web, render bài viết, nhúng playground |
| **Web AI Runtime** | LiteRT Web SDK (WebGPU, fallback WebAssembly) | Chạy model AI trực tiếp trên trình duyệt |
| **Web API** | Next.js API Routes | RESTful API, business logic, xác thực |
| **Database** | PostgreSQL (Supabase) | Relational database với RLS, triggers, JSONB |
| **Authentication** | Firebase Auth | Quản lý user, hỗ trợ email/password và Google Sign-In |
| **Model Storage** | Public CDN (jsDelivr / Hugging Face) | Host model files, miễn phí, globally distributed |
| **Image Storage** | Cloudinary | Upload và serve hình ảnh bài viết |

### 2.2. Chi tiết từng lớp

#### Web Client (Next.js)

| Thư viện / Công cụ | Mục đích |
| --------------------- | ---------- |
| React / Next.js (App Router) | Framework UI chính, SSR + API Routes |
| firebase / firebase-admin | Đăng nhập trên client, kiểm tra ID token trên server |
| KaTeX | Render công thức toán LaTeX trong bài viết |
| react-markdown + remark-gfm | Render Markdown content |
| LiteRT Web SDK | Load và chạy `.tflite` model qua WebGPU (fallback WebAssembly) |
| Tailwind CSS | Styling framework |

---

## 3. Luồng xác thực (Authentication Flow)

```mermaid
sequenceDiagram
    actor User
    participant Client as Client (Web)
    participant FB as Firebase Auth
    participant API as Next.js API Routes
    participant DB as PostgreSQL

    User->>Client: Nhấn đăng nhập (Email/Google)
    Client->>FB: signInWithEmailAndPassword()<br/>hoặc signInWithPopup(Google)
    FB-->>Client: User + ID token (hết hạn sau ~1 giờ)

    Note over Client: Firebase giữ phiên trong trình duyệt<br/>và tự làm mới token.

    Client->>API: POST /api/v1/users/me<br/>Authorization: Bearer <ID token>
    API->>API: requireUser() — verifyIdToken (firebase-admin)
    API->>DB: Upsert users + user_progress (service_role)

    Client->>API: GET /api/v1/users/progress<br/>Authorization: Bearer <ID token>

    alt Token hợp lệ
        API->>DB: Query theo uid (service_role)
        API-->>Client: 200 OK + Response Data
    else Thiếu / sai / hết hạn token
        API-->>Client: 401 Unauthorized
    else Route admin, thiếu claim admin
        API-->>Client: 403 Forbidden
    end
```

**Ghi chú quan trọng:**

- Firebase ID token có **thời hạn 1 giờ**. `apiFetch` gọi `getIdToken()` trước mỗi request, hàm này tự làm mới token khi sắp hết hạn.
- API Routes **không lưu session** — mỗi request đều verify token độc lập (stateless).
- Một số endpoint public (đọc bài viết, xem danh sách) **không yêu cầu auth**.

---

## 4. Luồng download model

```mermaid
sequenceDiagram
    actor User
    participant Client as Client (Web)
    participant API as Next.js API Routes
    participant DB as PostgreSQL
    participant CDN as Public CDN

    User->>Client: Mở playground trong bài viết

    Client->>API: GET /api/v1/models/{modelId}
    API->>DB: SELECT * FROM models WHERE id = $1
    DB-->>API: Model info
    API-->>Client: 200 OK + Model metadata<br/>{ name, version, size,<br/>fileUrl, metadataUrl }

    Client->>CDN: GET {metadataUrl}
    CDN-->>Client: metadata.json

    Client->>CDN: GET {fileUrl}<br/>(Public access, không cần auth)
    CDN-->>Client: Model file (.tflite)

    Client->>Client: Load model vào LiteRT runtime
```

**Caching:** Ứng dụng không tự cache model (không dùng Cache API / IndexedDB, Service Worker bỏ qua request cross-origin). Việc tải lại hay không phụ thuộc hoàn toàn vào HTTP cache của trình duyệt theo header của CDN.

**Tại sao dùng Public CDN?**

- Model files là tài nguyên giáo dục, không chứa dữ liệu nhạy cảm.
- Public CDN (jsDelivr, Hugging Face) giúp client tải trực tiếp mà không cần proxy qua API, giảm latency.
- CDN miễn phí và globally distributed → tối ưu chi phí và tốc độ.

---

## 5. Luồng inference on-device

```mermaid
sequenceDiagram
    actor User
    participant UI as UI Layer
    participant Runtime as LiteRT Runtime
    participant Preprocessor as Preprocessor
    participant Model as AI Model (.tflite)
    participant Postprocessor as Postprocessor

    User->>UI: Nhấn "Chạy thử" trong playground
    
    UI->>Runtime: Kiểm tra model đã load chưa
    
    alt Model chưa load
        Runtime->>Runtime: Tải model từ CDN vào memory
        Runtime->>Runtime: Khởi tạo LiteRT runtime
        Note over Runtime: WebGPU nếu trình duyệt hỗ trợ,<br/>ngược lại fallback WebAssembly (CPU)
    end

    User->>UI: Chọn input source
    
    alt Camera real-time
        UI->>UI: Cấp quyền camera (nếu chưa)
        UI->>Preprocessor: Camera frame liên tục
    else Upload ảnh
        User->>UI: Chọn ảnh từ gallery/file
        UI->>Preprocessor: Ảnh đã chọn
    end

    Preprocessor->>Preprocessor: Resize về input size (vd: 640x640)<br/>Normalize pixel values [0,1]<br/>Chuyển sang format tensor

    Preprocessor->>Model: Input tensor
    Model->>Model: Forward pass (inference)
    Model-->>Postprocessor: Raw output tensor

    Postprocessor->>Postprocessor: Decode predictions<br/>Apply Non-Maximum Suppression (NMS)<br/>Lọc theo confidence threshold

    Postprocessor-->>UI: Kết quả detection:<br/>- Bounding boxes (x, y, w, h)<br/>- Class labels<br/>- Confidence scores<br/>- Inference time (ms)

    UI->>UI: Vẽ bounding boxes lên ảnh/camera feed<br/>Hiển thị label + confidence %<br/>Hiển thị inference time
```

**Accelerator của LiteRT Web SDK:**

Code hiện tại ([useModelLoader.ts](../../src/hooks/playground/useModelLoader.ts)) gọi `loadAndCompile(url)` không truyền `accelerator`, nên LiteRT.js tự chọn theo trình duyệt:

| Accelerator | Điều kiện | Ghi chú |
| ----------- | --------- | ------- |
| **WebGPU** | Trình duyệt có `navigator.gpu` và tạo được GPU device (`powerPreference: high-performance`) | Được chọn mặc định nếu khả dụng |
| **WASM (CPU)** | Không có WebGPU hoặc tạo GPU device thất bại | Fallback |

> [!NOTE]
> Phần lõi của LiteRT.js luôn là WebAssembly (`loadLiteRt()` tải file `.wasm` từ CDN), kể cả khi inference chạy trên WebGPU. LiteRT.js không có backend WebGL.
> Latency thực tế cần đo qua Telemetry Panel trên từng thiết bị.

---

## 6. Bảo mật defense-in-depth

### 6.1. Mô hình bảo vệ

```mermaid
graph TB
    CLIENT["Client Request<br/>(Authorization: Bearer ID token)"] --> API_LAYER
    PUBLIC["Truy cập bằng anon key<br/>(trang tĩnh, API công khai)"] --> RLS_LAYER

    subgraph API_LAYER["Next.js API Routes"]
        VERIFY["requireUser / requireAdmin<br/>(firebase-admin verifyIdToken)"]
        PERMISSION["Lọc theo uid, kiểm tra claim admin"]
        VALIDATE["Validate input data"]

        VERIFY --> PERMISSION --> VALIDATE
    end

    API_LAYER -->|"service_role"| DATA

    subgraph RLS_LAYER["PostgreSQL RLS (anon)"]
        READ_ONLY["Chỉ SELECT nội dung đã xuất bản<br/>Không đọc users/user_progress, không ghi"]
    end

    RLS_LAYER --> DATA["PostgreSQL Data"]

    style API_LAYER fill:#7c3aed,stroke:#5b21b6,color:#fff
    style RLS_LAYER fill:#3b82f6,stroke:#1d4ed8,color:#fff
    style CLIENT fill:#22c55e,stroke:#15803d,color:#fff
    style DATA fill:#f59e0b,stroke:#d97706,color:#fff
```

### 6.2. Ai bảo vệ cái gì?

| Kịch bản | Bảo vệ bởi |
| --- | --- |
| Request tới API không có token / token giả | `requireUser` trả `401` |
| User thường gọi route admin | `requireAdmin` trả `403` |
| Đọc hoặc ghi tiến độ của người khác | API luôn lọc theo `uid` lấy từ token, không lấy từ request |
| Bỏ qua API, dùng anon key gọi thẳng Supabase | RLS: chỉ đọc được nội dung đã xuất bản, không ghi được gì |

Vì API dùng `service_role` (bỏ qua RLS), mọi route chạm dữ liệu người dùng hoặc ghi dữ liệu **bắt buộc** gọi `requireUser` / `requireAdmin` trước.

### 6.3. Nguyên tắc bảo mật bổ sung

- **HTTPS everywhere** — Vercel tự cung cấp SSL.
- **`SUPABASE_SERVICE_ROLE_KEY` và `FIREBASE_SERVICE_ACCOUNT` chỉ dùng phía server** — không bao giờ import trong Client Components.
- **Input validation** — API validate mọi input trước khi xử lý.
- **CORS** — Chỉ cho phép origin của web client.
- **Model files là public** — Không chứa dữ liệu nhạy cảm.

---

## 7. Cấu trúc thư mục dự án

```text
Sequoia/
├── web/                        # Web client + API (Next.js Full-stack)
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   │   ├── api/v1/        # API Routes (REST endpoints)
│   │   │   │   ├── admin/     # Admin CRUD (articles, topics, models, textbooks)
│   │   │   │   ├── users/     # User profile & progress
│   │   │   │   └── cosmos/    # Cosmos maps
│   │   │   ├── auth/          # Auth page
│   │   │   ├── dashboard/     # User dashboard
│   │   │   ├── genesis/       # Admin CMS (Genesis Core)
│   │   │   ├── articles/      # Article pages
│   │   │   └── playground/    # Model playground
│   │   ├── components/        # Reusable UI components
│   │   │   ├── admin/         # Admin components (GenesisClient, Forges)
│   │   │   ├── cosmos/        # Galaxy map, nodes
│   │   │   └── ui/            # Common UI elements
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # Service layer (AdminService, UploadService)
│   │   ├── utils/             # Utilities
│   │   │   └── supabase/      # Supabase clients (client.ts, server.ts, admin.ts)
│   │   └── contexts/          # React contexts (Auth, Theme)
│   ├── scripts/               # Seed scripts
│   ├── supabase/migrations/   # SQL migration files
│   ├── package.json
│   └── next.config.ts
│
├── docs/                       # Tài liệu dự án
│   ├── design/                # Thiết kế kỹ thuật
│   ├── analysis/              # Phân tích luồng người dùng
│   ├── requirements/          # PRD
│   ├── management/            # Quy ước, master plan
│   ├── operations/            # Hướng dẫn triển khai
│   └── guides/                # Hướng dẫn sử dụng
│
├── .github/                    # CI/CD workflows
├── .gitignore
└── README.md
```

**Quy ước đặt tên:**

| Quy ước | Ví dụ | Áp dụng cho |
| --------- | ------- | ------------- |
| camelCase | `useAuth.ts`, `adminService.ts` | TypeScript files, hooks |
| PascalCase | `GenesisClient.tsx`, `PlaygroundCard.tsx` | React components |
| kebab-case | `user-flows.md`, `api-contract.md` | Documentation files |
| snake_case | `seed_models.ts`, `00_init.sql` | Seed scripts, SQL migrations |
