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
  type: 'bbox_corners' | 'bbox_solid' | 'skeleton' | 'mask_overlay' | 'top_k_overlay' | 'background_removal' | 'ocr_text';
  show_labels?: boolean;
  show_confidence?: boolean;
  skeleton?: number[][] | null;
  keypoint_labels?: string[] | null;
}

/**
 * Per-channel normalization applied after scaling pixels (default scale 1/255): (v - mean) / std.
 * metadata.json may also set a `scale`; useInference reads it even though it is not typed here.
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
  /** URL of the .tflite file. The single source for where the model lives. */
  model_url?: string;
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

  /** Several models chained together (e.g. OCR: text detector, then recognizer per line). */
  pipeline?: PipelineConfig;
}

/**
 * One model in a pipeline. The stage's input is either the whole image, or (with `for_each`)
 * each region found by an earlier stage, cropped from the original image.
 */
export interface PipelineStage {
  /** Name other stages refer to (e.g. "det"). */
  id: string;
  model_url: string;
  /** Optional build of the same model tuned for WebGPU; used when running on WebGPU. */
  model_url_webgpu?: string;
  /** Run once per region produced by this earlier stage. */
  for_each?: string;
  /** [1, C, H, W] for NCHW or [1, H, W, C] for NHWC. */
  input_size: number[];
  input_layout?: 'nhwc' | 'nchw';
  color_space?: 'rgb' | 'bgr';
  normalize?: NormalizeConfig;
  /**
   * How the image (or region) fits the input: "stretch" to the full size, or "keep_aspect_pad":
   * scale to the input height keeping the aspect ratio, then pad the rest of the width.
   */
  resize?: 'stretch' | 'keep_aspect_pad';
  /** Value written into padded input cells (already normalized), e.g. -1. */
  pad_value?: number;
  /** Step that turns this stage's raw output into its result (see src/lib/inference/pipeline/steps.ts). */
  then: string;
  /** Settings for that step; a playground parameter with the same key overrides it. */
  options?: Record<string, number>;
}

export interface PipelineConfig {
  stages: PipelineStage[];
  /** Extra files the steps need, by key (e.g. { "dict": "https://.../dict.txt" }). Loaded as text. */
  assets?: Record<string, string>;
  /** How the stage results become the final result (see ASSEMBLERS in src/lib/inference/pipeline/run.ts). */
  result: string;
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
 * A detection box in canvas pixels, center format (cx, cy = box center).
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
  /** Instance segmentation mask coefficients (YOLOv8-seg); null for other tasks. */
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
 * Parsed result for Image-to-Image tasks (style transfer, depth estimation, super-resolution).
 * Background removal is a semantic-segmentation result instead.
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
 * `count` in each is what the telemetry panel shows as the detection count.
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
