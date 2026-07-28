import { useState, useRef, useCallback, useEffect } from 'react';

const CANVAS_SIZE = 10000;

interface PanZoomOptions {
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
}

export default function usePanZoom(
  viewportRef: React.RefObject<HTMLDivElement | null>,
  options: PanZoomOptions = {}
) {
  const { initialScale = 0.5, minScale: minScaleOverride, maxScale = 2 } = options;

  const [scale, setScale] = useState(initialScale);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const getContainerSize = useCallback(() => {
    if (viewportRef.current) {
      return {
        w: viewportRef.current.clientWidth,
        h: viewportRef.current.clientHeight,
      };
    }
    return { w: 800, h: 500 };
  }, [viewportRef]);

  const getMinScale = useCallback(() => {
    if (minScaleOverride !== undefined) return minScaleOverride;
    const { w, h } = getContainerSize();
    return Math.max(w / CANVAS_SIZE, h / CANVAS_SIZE, 0.08);
  }, [getContainerSize, minScaleOverride]);

  const clampTranslate = useCallback((tx: number, ty: number, s: number) => {
    const { w, h } = getContainerSize();
    const canvasW = CANVAS_SIZE * s;
    const canvasH = CANVAS_SIZE * s;
    const paddingX = w * 0.5;
    const paddingY = h * 0.5;
    const clampedX = Math.min(paddingX, Math.max(w - canvasW - paddingX, tx));
    const clampedY = Math.min(paddingY, Math.max(h - canvasH - paddingY, ty));
    return { x: clampedX, y: clampedY };
  }, [getContainerSize]);

  const flyTo = useCallback((x: number, y: number, s?: number) => {
    setIsTransitioning(true);
    const computedMinScale = getMinScale();
    const newScale = Math.max(s ?? 0.6, computedMinScale);
    const { w, h } = getContainerSize();
    const rawX = (w / 2) - (x * newScale);
    const rawY = (h / 2) - (y * newScale);
    const clamped = clampTranslate(rawX, rawY, newScale);
    setTranslateX(clamped.x);
    setTranslateY(clamped.y);
    setScale(newScale);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [getMinScale, getContainerSize, clampTranslate]);

  // Wheel zoom
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.002;
      const computedMinScale = getMinScale();
      let newScale = scale * Math.exp(delta);
      newScale = Math.max(computedMinScale, Math.min(newScale, maxScale));

      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const rawX = mouseX - (mouseX - translateX) * (newScale / scale);
      const rawY = mouseY - (mouseY - translateY) * (newScale / scale);
      const clamped = clampTranslate(rawX, rawY, newScale);

      setTranslateX(clamped.x);
      setTranslateY(clamped.y);
      setScale(newScale);
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [scale, translateX, translateY, getMinScale, clampTranslate, maxScale, viewportRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX - translateX;
    startY.current = e.clientY - translateY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const rawX = e.clientX - startX.current;
    const rawY = e.clientY - startY.current;
    const clamped = clampTranslate(rawX, rawY, scale);
    setTranslateX(clamped.x);
    setTranslateY(clamped.y);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return {
    scale,
    translateX,
    translateY,
    isTransitioning,
    flyTo,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
    },
  };
}
