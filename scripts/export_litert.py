import os
from ultralytics import YOLO

def export_models():
    # Tạo thư mục chứa model sau khi export
    output_dir = "exported_models"
    os.makedirs(output_dir, exist_ok=True)

    # Danh sách các model YOLOv8 siêu nhẹ (Nano) cần tải và convert
    models_to_export = [
        {"name": "yolov8n.pt", "task": "Object Detection"},
        {"name": "yolov8n-cls.pt", "task": "Image Classification"},
        {"name": "yolov8n-pose.pt", "task": "Pose Estimation"},
        {"name": "yolov8n-seg.pt", "task": "Instance Segmentation"}
    ]

    for item in models_to_export:
        model_name = item["name"]
        task_name = item["task"]
        print(f"\n[{task_name}] Đang tải và nạp mô hình: {model_name}...")
        
        # Hàm YOLO() sẽ tự động tải file .pt từ internet về nếu chưa có
        model = YOLO(model_name)
        
        print(f"[{task_name}] Đang bắt đầu convert sang LiteRT...")
        # Export sang LiteRT format
        # Có thể thêm int8=True nếu muốn giảm một nửa dung lượng (tuy nhiên cần có data calibration)
        # Ở đây mình dùng cấu hình mặc định
        export_path = model.export(format='litert')
        
        print(f"[{task_name}] Thành công! File LiteRT được lưu tại: {export_path}")

if __name__ == "__main__":
    print("=== BẮT ĐẦU QUÁ TRÌNH TẢI VÀ CONVERT LITERT ===")
    export_models()
    print("\n=== HOÀN TẤT! ===")
    print("Sếp có thể copy các file .tflite sinh ra để upload lên Cloudflare R2 nhé!")
