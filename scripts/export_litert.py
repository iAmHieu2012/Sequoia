"""Downloads the YOLOv8 Nano models and exports them to LiteRT (.tflite) in ./exported_models."""
import os
from ultralytics import YOLO

def export_models():
    output_dir = "exported_models"
    os.makedirs(output_dir, exist_ok=True)

    # YOLOv8 Nano variants to download and convert
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
        
        # YOLO() downloads the .pt weights if they are not already present
        model = YOLO(model_name)
        
        print(f"[{task_name}] Đang bắt đầu convert sang LiteRT...")
        # Default (float) export. int8=True would roughly halve the size but needs calibration data.
        export_path = model.export(format='litert')
        
        print(f"[{task_name}] Thành công! File LiteRT được lưu tại: {export_path}")

if __name__ == "__main__":
    print("=== BẮT ĐẦU QUÁ TRÌNH TẢI VÀ CONVERT LITERT ===")
    export_models()
    print("\n=== HOÀN TẤT! ===")
    print("Sếp có thể copy các file .tflite sinh ra để upload lên Cloudflare R2 nhé!")
