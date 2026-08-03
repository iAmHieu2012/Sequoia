import { BoundingBox } from './types';

export function renderDetection(
  dCtx: CanvasRenderingContext2D,
  b: BoundingBox,
  numClasses: number,
  modelLabels?: string[]
) {
  const x = b.cx - b.w / 2;
  const y = b.cy - b.h / 2;
  const cLen = Math.min(15, b.w * 0.25, b.h * 0.25);
  const coralColor = '#FF5050';
  
  // CyberBrackets corners
  dCtx.strokeStyle = coralColor;
  dCtx.lineWidth = 2;
  
  // Top-left
  dCtx.beginPath();
  dCtx.moveTo(x, y + cLen);
  dCtx.lineTo(x, y);
  dCtx.lineTo(x + cLen, y);
  dCtx.stroke();

  // Top-right
  dCtx.beginPath();
  dCtx.moveTo(x + b.w - cLen, y);
  dCtx.lineTo(x + b.w, y);
  dCtx.lineTo(x + b.w, y + cLen);
  dCtx.stroke();

  // Bottom-left
  dCtx.beginPath();
  dCtx.moveTo(x, y + b.h - cLen);
  dCtx.lineTo(x, y + b.h);
  dCtx.lineTo(x + cLen, y + b.h);
  dCtx.stroke();

  // Bottom-right
  dCtx.beginPath();
  dCtx.moveTo(x + b.w - cLen, y + b.h);
  dCtx.lineTo(x + b.w, y + b.h);
  dCtx.lineTo(x + b.w, y + b.h - cLen);
  dCtx.stroke();

  // Faint inner box
  dCtx.globalAlpha = 0.2;
  dCtx.strokeStyle = coralColor;
  dCtx.strokeRect(x, y, b.w, b.h);
  dCtx.globalAlpha = 1.0;
  
  let label = `OBJ ${b.classId}`;
  if (modelLabels && modelLabels.length > b.classId) {
    label = modelLabels[b.classId];
  }
  
  const text = `${label.toUpperCase()} ${(b.conf * 100).toFixed(0)}%`;
  dCtx.font = '10px monospace';
  const textWidth = dCtx.measureText(text).width;
  
  // Label background
  dCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  dCtx.fillRect(x, y - 18, textWidth + 8, 18);
  
  // Label text
  dCtx.fillStyle = coralColor;
  dCtx.fillText(text, x + 4, y - 5);
}
