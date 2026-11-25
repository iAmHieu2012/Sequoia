import type { Region } from './preprocess';

/** What a step receives: the stage's first output tensor, already read into memory. */
export interface StepInput {
  data: Float32Array;
  shape: number[];
  /** Source image size, to map model coordinates back to image pixels. */
  imageWidth: number;
  imageHeight: number;
  /** Step settings (metadata `options`, overridden by playground parameters with the same key). */
  options: Record<string, number>;
  /** Pipeline assets loaded as text, by key. */
  assets: Record<string, string>;
}

/** A stage result: regions for later `for_each` stages, and/or text for the result. */
export interface StepOutput {
  regions?: Region[];
  text?: string;
  conf?: number;
}

type Step = (input: StepInput) => StepOutput;

/**
 * DB-style text probability map -> text line regions (PP-OCR detector).
 * Threshold, 4-connected components, drop tiny or weak blobs, pad each box
 * (approximates DB "unclip"), then scale to image pixels. Sorted top to bottom, left to right.
 * Options: threshold (0.3), min_score (0.5), max_detections (50).
 */
function probMapToRegions({ data, shape, imageWidth, imageHeight, options }: StepInput): StepOutput {
  const H = shape[shape.length - 2];
  const W = shape[shape.length - 1];
  const threshold = options.threshold ?? 0.3;
  const minScore = options.min_score ?? 0.5;
  const maxRegions = options.max_detections ?? 50;

  const labels = new Uint8Array(W * H); // 1 = visited
  const stack: number[] = [];
  const regions: Region[] = [];

  for (let start = 0; start < W * H; start++) {
    if (labels[start] || data[start] <= threshold) continue;
    let minX = W, minY = H, maxX = 0, maxY = 0, sum = 0, n = 0;
    labels[start] = 1;
    stack.push(start);
    while (stack.length) {
      const i = stack.pop()!;
      const x = i % W, y = (i / W) | 0;
      sum += data[i]; n++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (x > 0 && !labels[i - 1] && data[i - 1] > threshold) { labels[i - 1] = 1; stack.push(i - 1); }
      if (x < W - 1 && !labels[i + 1] && data[i + 1] > threshold) { labels[i + 1] = 1; stack.push(i + 1); }
      if (y > 0 && !labels[i - W] && data[i - W] > threshold) { labels[i - W] = 1; stack.push(i - W); }
      if (y < H - 1 && !labels[i + W] && data[i + W] > threshold) { labels[i + W] = 1; stack.push(i + W); }
    }
    const w = maxX - minX + 1, h = maxY - minY + 1;
    if (w < 6 || h < 6 || sum / n < minScore) continue;
    const pad = Math.min(24, Math.max(2, Math.round(0.35 * Math.min(w, h))));
    const x0 = Math.max(0, minX - pad), y0 = Math.max(0, minY - pad);
    const x1 = Math.min(W - 1, maxX + pad), y1 = Math.min(H - 1, maxY + pad);
    const sx = imageWidth / W, sy = imageHeight / H;
    regions.push({ x: x0 * sx, y: y0 * sy, w: (x1 - x0 + 1) * sx, h: (y1 - y0 + 1) * sy, score: sum / n });
  }

  regions.sort((a, b) => a.y - b.y || a.x - b.x);
  return { regions: regions.slice(0, maxRegions) };
}

/**
 * Greedy CTC decode of [1, T, C] scores -> text (PP-OCR recognizer).
 * Index 0 is the blank, then the dictionary lines, then a space (PP-OCR layout).
 * The model already ends in softmax, so the score of the chosen class is its probability.
 * Needs the `dict` asset (one character per line).
 */
const dictCache = new Map<string, string[]>();
function ctcDecode({ data, shape, assets }: StepInput): StepOutput {
  const dictText = assets.dict;
  if (dictText === undefined) throw new Error('ctc_decode needs a "dict" asset');
  let chars = dictCache.get(dictText);
  if (!chars) {
    const lines = dictText.split('\n').map(l => l.replace(/\r$/, ''));
    if (lines[lines.length - 1] === '') lines.pop();
    chars = ['', ...lines, ' '];
    dictCache.set(dictText, chars);
  }

  const T = shape[shape.length - 2];
  const C = shape[shape.length - 1];
  let text = '';
  let prev = -1, confSum = 0, confN = 0;
  for (let t = 0; t < T; t++) {
    let best = 0, bestV = -Infinity;
    for (let c = 0; c < C; c++) {
      const v = data[t * C + c];
      if (v > bestV) { bestV = v; best = c; }
    }
    if (best !== 0 && best !== prev) {
      text += chars[best] ?? '';
      confSum += bestV;
      confN++;
    }
    prev = best;
  }
  return { text: text.trim(), conf: confN ? confSum / confN : 0 };
}

/** Steps a metadata.json stage can name in `then`. */
export const STEPS: Record<string, Step> = {
  prob_map_to_regions: probMapToRegions,
  ctc_decode: ctcDecode,
};
