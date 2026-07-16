# Hướng dẫn chuyển đổi mô hình AI (YOLO → LiteRT)

Tài liệu này hướng dẫn các bước để xuất một mô hình YOLO sang định dạng LiteRT, kiểm tra cục bộ và tải lên Cloudflare R2 để hệ thống Sequoia có thể sử dụng cho Model Playground.

## 1. Yêu cầu môi trường

- Python 3.9+
- Các thư viện cần thiết cài đặt qua pip:

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

## 4. Bước 3: Upload lên Cloudflare R2

Sau khi có file `.tflite` hợp lệ, cần tải lên R2 để client (Web/Android) có thể tải về.

1. Đăng nhập **Cloudflare Dashboard**.
2. Mở mục **R2 Object Storage** và chọn bucket của dự án.
3. Upload file `yolov8n_int8.tflite` vào thư mục `models/yolov8/`.
4. Đảm bảo R2 bucket đã cấu hình public access hoặc có domain riêng để cho phép tải trực tiếp file (Ví dụ: `https://cdn.sequoia.app/models/yolov8/yolov8n_int8.tflite`).

## 5. Bước 4: Cập nhật Firestore

Để client biết thông tin và đường dẫn tải mô hình, tạo/cập nhật một document trong collection `models` trên Firestore:

```json
{
  "id": "yolo-v8-nano",
  "name": "YOLOv8 Nano",
  "description": "Mô hình nhận diện vật thể nhẹ và nhanh nhất của YOLOv8.",
  "taskType": "object_detection",
  "fileUrl": "https://cdn.sequoia.app/models/yolov8/yolov8n_int8.tflite",
  "fileSizeBytes": 3200000,
  "version": "1.0",
  "format": "litert",
  "defaultConfig": {
    "threshold": 0.5,
    "inputSize": 640
  },
  "createdAt": "2023-10-25T10:00:00Z"
}
```

## 6. Lưu ý quan trọng

- **Quantization (Lượng tử hóa):** Nên sử dụng INT8 Quantization (`int8=True`) thay vì Float16 hoặc Float32. INT8 làm giảm độ chính xác một chút nhưng giảm 4 lần dung lượng model và tăng tốc đáng kể, rất cần thiết cho ứng dụng Web.
- **Kích thước mô hình:** Cố gắng giữ file `.tflite` dưới 10MB để thời gian tải trang không bị ảnh hưởng.
- **Compatibility (Tương thích):**
  - Web: Sử dụng LiteRT Web API (WASM/WebGL).
  - Android: LiteRT API hỗ trợ Neural Networks API (NNAPI) hoặc GPU delegate để tận dụng phần cứng.
- **Ủy quyền phần cứng (Delegates):** Mặc định chạy trên CPU. Trên Android, nên kích hoạt GPU Delegate nếu có.

## 7. Troubleshooting (Xử lý sự cố)

| Lỗi thường gặp | Nguyên nhân và Cách xử lý |
| --- | --- |
| `Unsupported ops` khi export | Mô hình dùng toán tử chưa được TFLite hỗ trợ. Cập nhật thư viện `ultralytics` và `tensorflow` mới nhất. |
| Kết quả suy luận (Inference) toàn 0 hoặc nhiễu | Sai bước tiền xử lý ảnh. Kiểm tra lại việc chuẩn hóa `/ 255.0` hoặc thứ tự kênh màu RGB/BGR. |
| Model chạy chậm trên Web | Quên áp dụng Quantization INT8. Xuất lại model với tham số `int8=True`. |
| Lỗi CORS khi tải model từ R2 | Cloudflare R2 bucket chưa cấu hình CORS cho domain của ứng dụng Web. Bổ sung CORS rule trên R2. |
