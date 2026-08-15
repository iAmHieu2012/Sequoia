// ============================================================
// Metadata Schema Types (mirrors metadata.json on CDN)
// ============================================================

export interface ParameterDefinition {
  key: string;
  label: string;
  type: 'slider' | 'toggle' | 'select';
  min?: number;
  max?: number;
  step?: number;
  default: number | boolean | string;
  options?: { label: string; value: string }[];
}

export interface PostProcessingConfig {
  type: string;
  num_keypoints?: number | null;
  num_mask_coefficients?: number | null;
  simcc_split_ratio?: number;
  default_threshold?: number;
  default_iou?: number;
  default_max_detections?: number;
  default_top_k?: number;
  default_keypoint_threshold?: number;
  default_mask_opacity?: number;
}

export interface VisualizationConfig {
  type: 'bbox_corners' | 'bbox_solid' | 'skeleton' | 'mask_overlay' | 'top_k_overlay' | 'background_removal';
  show_labels?: boolean;
  show_confidence?: boolean;
  skeleton?: number[][] | null;
  keypoint_labels?: string[] | null;
}

export interface NormalizeConfig {
  mean: number[];
  std: number[];
}

export interface ModelMetadata {
  name: string;
  task: string;
  description: string;
  architecture: string;
  variant: string;
  dataset: string;
  format: string;
  version: string;

  labels: string[];
  classes_count: number;

  input_size: number[];
  input_layout?: 'nhwc' | 'nchw';
  output_format: string;
  color_space?: 'rgb' | 'bgr';
  normalize?: NormalizeConfig;
  supported_modes?: ('camera' | 'image')[];

  post_processing: PostProcessingConfig;
  visualization: VisualizationConfig;
  parameters: ParameterDefinition[];
}

// ============================================================
// Runtime Model Type (DB record + loaded metadata)
// ============================================================

export interface AiModel {
  id: string;
  name: string;
  description: string;
  task_type: string;
  file_url: string;
  metadata_url: string;
  version: string;
  format: string;
  file_size_bytes?: number;
  metadata: ModelMetadata | null;
}

// ============================================================
// Inference Types
// ============================================================

export interface Keypoint {
  x: number;
  y: number;
  conf: number;
  id?: number;
  label?: string;
}

export interface BoundingBox {
  cx: number;
  cy: number;
  w: number;
  h: number;
  conf: number;
  classId: number;
  label?: string;
  keypoints: Keypoint[];
  maskCoeffs: Float32Array | null;
}

export interface ParsedDetectionResult {
  type: 'detection';
  boxes: BoundingBox[];
  numClasses: number;
  count: number;
}

export interface ParsedClassificationResult {
  type: 'classification';
  topK: { classId: number; label: string; confidence: number }[];
  count: number;
}

export interface ParsedSemanticSegmentationResult {
  type: 'semantic-segmentation';
  maskData: Uint8ClampedArray | ImageData;
  width: number;
  height: number;
  count: number;
}

export interface ParsedImageToImageResult {
  type: 'image-to-image';
  imageData: ImageData;
  width: number;
  height: number;
  count: number;
}

export interface ParsedOCRResult {
  type: 'ocr';
  texts: { polygon: {x: number, y: number}[], text: string, conf: number }[];
  count: number;
}

export interface ParsedPoseResult {
  type: 'pose';
  keypoints: Keypoint[];
  count: number;
}

export type ParsedResult = 
  | ParsedDetectionResult 
  | ParsedClassificationResult 
  | ParsedSemanticSegmentationResult
  | ParsedImageToImageResult
  | ParsedOCRResult
  | ParsedPoseResult;

// ============================================================
// Playground Telemetry
// ============================================================

export interface PlaygroundTelemetry {
  fps: number;
  inferenceTime: number;
  avgInferenceTime: number;
  detectionCount: number;
  memoryUsageMB: number | null;
  inputResolution: string;
  modelSizeBytes: number;
}

// ============================================================
// Playground Params (dynamic, driven by metadata.parameters)
// ============================================================

export type ParamValue = number | boolean | string;
export type PlaygroundParams = Record<string, ParamValue>;
