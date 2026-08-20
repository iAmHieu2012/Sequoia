# Hướng dẫn chuyển đổi mô hình AI (YOLO → LiteRT)

Tài liệu này hướng dẫn các bước để xuất một mô hình YOLO sang định dạng LiteRT, kiểm tra cục bộ và đẩy lên repository GitHub `sequoia-models` để hệ thống Sequoia có thể sử dụng cho Model Playground.

## 1. Yêu cầu môi trường

* Python 3.9+
* Các thư viện cần thiết cài đặt qua pip:
```bash
pip install ultralytics tensorflow ai-edge-litert

```



## 2. Bước 1: Export YOLO sang TFLite/LiteRT

Sử dụng thư viện `ultralytics` để xuất mô hình YOLOv8 sang định dạng TFLite. LiteRT sử dụng chung định dạng file `.tflite`.

```python
from ultralytics import YOLO

# Tải mô hình YOLOv8 nano (nhẹ, phù hợp chạy trên thiết bị di động/web)
model = YOLO('yolov8n.pt')

# Xuất sang định dạng tflite
# Tham số int8=True để áp dụng Quantization giúp giảm dung lượng model
model.export(format='tflite', int8=True)

```

Sau khi chạy, bạn sẽ thu được một file dạng `yolov8n_saved_model/yolov8n_int8.tflite`.

## 3. Bước 2: Test model cục bộ

Chạy script Python để tải mô hình LiteRT và infer trên một bức ảnh mẫu nhằm đảm bảo việc xuất mô hình thành công.

```python
import numpy as np
import tensorflow as tf
from PIL import Image

# Đường dẫn tới file tflite
model_path = "yolov8n_saved_model/yolov8n_int8.tflite"

# Khởi tạo Interpreter
interpreter = tf.lite.Interpreter(model_path=model_path)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Tải và chuẩn bị ảnh (resize theo input shape của model, thường là 640x640)
input_shape = input_details[0]['shape']
img = Image.open('sample.jpg').resize((input_shape[1], input_shape[2]))
input_data = np.expand_dims(np.array(img, dtype=np.float32) / 255.0, axis=0)

# Chạy inference
interpreter.set_tensor(input_details[0]['index'], input_data)
interpreter.invoke()

# Lấy output
output_data = interpreter.get_tensor(output_details[0]['index'])
print("Kết quả inference (shape):", output_data.shape)

```

## 4. Bước 3: Lưu trữ mô hình vào repo `sequoia-models`

Hệ thống quản lý model thông qua repository `sequoia-models` trên GitHub. Mỗi mô hình sẽ nằm trong một thư mục riêng biệt.

1. Clone repository `sequoia-models` về máy cục bộ.
2. Tạo một thư mục mới mang tên mô hình (ví dụ: `yolov8n-detect`).
3. Copy file `.tflite` vừa xuất ở Bước 1 vào thư mục này.
4. Tạo thêm một file `metadata.json` để chứa thông tin, nhãn (labels), và cấu hình của mô hình.

Cấu trúc thư mục của repo `sequoia-models` sẽ trông như sau:

```text
sequoia-models/
├── yolov8n-detect/
│   ├── yolov8n_int8.tflite
│   └── metadata.json
├── another-model-name/
│   ├── model.tflite
│   └── metadata.json
└── ...

```

5. Thực hiện commit và push lên GitHub:
```bash
git add yolov8n-detect/
git commit -m "Add YOLOv8n object detection model"
git push origin main

```



## 5. Bước 4: Cập nhật Supabase PostgreSQL

Để client (Web/App) biết thông tin và đường dẫn tải mô hình, bạn cần cập nhật bảng `models` trên Supabase. Chúng ta sẽ sử dụng CDN jsDelivr (hoặc raw github url) để trỏ trực tiếp tới file trong repo `sequoia-models`.

```sql
INSERT INTO models (id, name, description, task_type, file_url, file_size_bytes, version, format, metadata_url)
VALUES (
  'yolov8n-detect',
  'YOLOv8 Nano',
  'Mô hình nhận diện vật thể nhẹ và nhanh nhất của YOLOv8.',
  'object-detection',
  'https://cdn.jsdelivr.net/gh/USERNAME/sequoia-models/yolov8n-detect/yolov8n_int8.tflite',
  3200000,
  '1.0',
  'litert',
  'https://cdn.jsdelivr.net/gh/USERNAME/sequoia-models/yolov8n-detect/metadata.json'
)
ON CONFLICT (id) DO UPDATE SET
  file_url = EXCLUDED.file_url,
  metadata_url = EXCLUDED.metadata_url,
  file_size_bytes = EXCLUDED.file_size_bytes,
  version = EXCLUDED.version;

```

*(Lưu ý: Thay `USERNAME` bằng tên tài khoản/tổ chức GitHub của bạn)*

Hoặc sử dụng Supabase Dashboard (Table Editor) để thao tác trực quan.

## 6. Lưu ý quan trọng

* **Quantization (Lượng tử hóa):** Nên sử dụng INT8 Quantization (`int8=True`) thay vì Float16 hoặc Float32. INT8 làm giảm độ chính xác một chút nhưng giảm 4 lần dung lượng model và tăng tốc đáng kể, rất cần thiết cho ứng dụng Web.
* **Kích thước giới hạn:** Vì lưu trên GitHub và fetch qua CDN miễn phí (như jsDelivr), hãy cố gắng giữ file `.tflite` dưới 20MB. (jsDelivr có giới hạn file size, thường là 20-50MB tuỳ chính sách).
* **Compatibility (Tương thích):**
* Web: Sử dụng LiteRT Web API (WASM/WebGL).
* Android: LiteRT API hỗ trợ Neural Networks API (NNAPI) hoặc GPU delegate để tận dụng phần cứng.


* **Ủy quyền phần cứng (Delegates):** Mặc định chạy trên CPU. Trên Android, nên kích hoạt GPU Delegate nếu có.

## 7. Troubleshooting (Xử lý sự cố)

| Lỗi thường gặp | Nguyên nhân và Cách xử lý |
| --- | --- |
| `Unsupported ops` khi export | Mô hình dùng toán tử chưa được TFLite hỗ trợ. Cập nhật thư viện `ultralytics` và `tensorflow` mới nhất. |
| Kết quả suy luận (Inference) toàn 0 hoặc nhiễu | Sai bước tiền xử lý ảnh. Kiểm tra lại việc chuẩn hóa `/ 255.0` hoặc thứ tự kênh màu RGB/BGR. |
| Model chạy chậm trên Web | Quên áp dụng Quantization INT8. Xuất lại model với tham số `int8=True`. |
| Lỗi CORS khi tải model từ GitHub | Tránh sử dụng link `raw.githubusercontent.com` trực tiếp trên web vì đôi khi gặp lỗi CORS. Hãy luôn sử dụng link CDN trung gian như `[https://cdn.jsdelivr.net/gh/](https://cdn.jsdelivr.net/gh/)...` |