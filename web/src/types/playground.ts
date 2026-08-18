import { AiModel as GlobalAiModel } from "./dashboard";

/**
 * Defines a dynamic parameter for the model (e.g., slider, toggle) parsed from metadata.json.
 */
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

/**
 * Configuration for post-processing model outputs (thresholds, IOUs, etc).
 */
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

/**
 * Rules for how the UI should visualize the model's output (boxes, skeletons, etc).
 */
export interface VisualizationConfig {
  type: 'bbox_corners' | 'bbox_solid' | 'skeleton' | 'mask_overlay' | 'top_k_overlay' | 'background_removal';
  show_labels?: boolean;
  show_confidence?: boolean;
  skeleton?: number[][] | null;
  keypoint_labels?: string[] | null;
}

/**
 * Image normalization parameters required before feeding data into the model.
 */
export interface NormalizeConfig {
  mean: number[];
  std: number[];
}

/**
 * The complete metadata schema loaded from the model's CDN metadata.json file.
 */
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

/**
 * Runtime Model Type (DB record + loaded metadata)
 */
export interface AiModel extends GlobalAiModel {
  metadata_url: string;
  metadata: ModelMetadata | null;
}

/**
 * Represents a single keypoint (e.g. joint in pose estimation).
 */
export interface Keypoint {
  x: number;
  y: number;
  conf: number;
  id?: number;
  label?: string;
}

/**
 * Represents a bounding box detection result.
 */
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

/**
 * Parsed result for Object Detection tasks.
 */
export interface ParsedDetectionResult {
  type: 'detection';
  boxes: BoundingBox[];
  numClasses: number;
  count: number;
}

/**
 * Parsed result for Image Classification tasks.
 */
export interface ParsedClassificationResult {
  type: 'classification';
  topK: { classId: number; label: string; confidence: number }[];
  count: number;
}

/**
 * Parsed result for Semantic Segmentation tasks.
 */
export interface ParsedSemanticSegmentationResult {
  type: 'semantic-segmentation';
  maskData: Uint8ClampedArray | ImageData;
  width: number;
  height: number;
  count: number;
}

/**
 * Parsed result for Image-to-Image tasks (e.g., Background Removal).
 */
export interface ParsedImageToImageResult {
  type: 'image-to-image';
  imageData: ImageData;
  width: number;
  height: number;
  count: number;
}

/**
 * Parsed result for OCR (Optical Character Recognition) tasks.
 */
export interface ParsedOCRResult {
  type: 'ocr';
  texts: { polygon: {x: number, y: number}[], text: string, conf: number }[];
  count: number;
}

/**
 * Parsed result for Pose Estimation tasks.
 */
export interface ParsedPoseResult {
  type: 'pose';
  keypoints: Keypoint[];
  count: number;
}

/**
 * Union type for all possible parsed inference results.
 */
export type ParsedResult = 
  | ParsedDetectionResult 
  | ParsedClassificationResult 
  | ParsedSemanticSegmentationResult
  | ParsedImageToImageResult
  | ParsedOCRResult
  | ParsedPoseResult;

/**
 * Live telemetry data collected during inference.
 */
export interface PlaygroundTelemetry {
  fps: number;
  inferenceTime: number;
  avgInferenceTime: number;
  detectionCount: number;
  memoryUsageMB: number | null;
  inputResolution: string;
  modelSizeBytes: number;
}

/**
 * Defines possible values for dynamic parameters.
 */
export type ParamValue = number | boolean | string;

/**
 * A dictionary of currently active parameter values in the playground.
 */
export type PlaygroundParams = Record<string, ParamValue>;
