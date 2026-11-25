import type { PipelineStage } from '@/types/playground';

/** A rectangle in source-image pixels. */
export interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Mean detector score inside the region, when the step provides one. */
  score?: number;
}

/** Input height, width and channel count from [1, C, H, W] (NCHW) or [1, H, W, C] (NHWC). */
export function inputDims(stage: PipelineStage): { h: number; w: number; c: number; nchw: boolean } {
  const [, a, b, c] = stage.input_size;
  const nchw = stage.input_layout === 'nchw';
  return nchw ? { c: a, h: b, w: c, nchw } : { h: a, w: b, c, nchw };
}

/**
 * Turns the image (or one region of it) into a stage's float input:
 * resize, RGB/BGR order, value / 255, then (v - mean) / std, laid out as NCHW or NHWC.
 * Uses one scratch canvas per call site to avoid re-allocating.
 */
export function imageToInput(
  source: CanvasImageSource,
  region: Region,
  stage: PipelineStage,
  scratch: OffscreenCanvasRenderingContext2D,
): Float32Array {
  const { h: H, w: W, c: C, nchw } = inputDims(stage);
  if (scratch.canvas.width !== W || scratch.canvas.height !== H) {
    scratch.canvas.width = W;
    scratch.canvas.height = H;
  }

  // Width actually covered by the image; the rest is padding.
  let drawW = W;
  if (stage.resize === 'keep_aspect_pad') {
    drawW = Math.min(Math.max(Math.round((H * region.w) / region.h), 1), W);
  }
  scratch.clearRect(0, 0, W, H);
  scratch.drawImage(source, region.x, region.y, region.w, region.h, 0, 0, drawW, H);
  const px = scratch.getImageData(0, 0, W, H).data;

  const mean = stage.normalize?.mean ?? [0, 0, 0];
  const std = stage.normalize?.std ?? [1, 1, 1];
  const bgr = stage.color_space === 'bgr';
  const pad = stage.pad_value ?? 0;
  const out = new Float32Array(C * H * W);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x;
      const i = p * 4;
      for (let c = 0; c < C; c++) {
        const srcC = bgr ? 2 - c : c;
        const v = x < drawW ? (px[i + srcC] / 255 - mean[c]) / std[c] : pad;
        out[nchw ? c * H * W + p : p * C + c] = v;
      }
    }
  }
  return out;
}
