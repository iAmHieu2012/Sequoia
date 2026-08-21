import { useRef, useCallback, useEffect } from 'react';

const CANVAS_SIZE = 10000;

interface PanZoomOptions {
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  /** Callback fired via requestAnimationFrame when map is dragged/zoomed */
  onUpdate?: (x: number, y: number, s: number, isTransitioning: boolean) => void;
}

/**
 * High-performance hook for panning and zooming a 2D canvas area.
 * Returns handlers to attach to a viewport div and a `flyTo` function.
 */
export function usePanZoom(
  viewportRef: React.RefObject<HTMLDivElement | null>,
  options: PanZoomOptions = {}
) {
  const { initialScale = 0.5, minScale: minScaleOverride, maxScale = 2, onUpdate } = options;

  const scale = useRef(initialScale);
  const translateX = useRef(0);
  const translateY = useRef(0);
  const isTransitioning = useRef(false);
  const flyToTimeout = useRef<NodeJS.Timeout | null>(null);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const notifyUpdate = useCallback(() => {
    if (onUpdate) {
      requestAnimationFrame(() => {
        onUpdate(translateX.current, translateY.current, scale.current, isTransitioning.current);
      });
    }
  }, [onUpdate]);

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
    isTransitioning.current = true;
    const computedMinScale = getMinScale();
    const newScale = Math.max(s ?? 0.6, computedMinScale);
    const { w, h } = getContainerSize();
    const rawX = (w / 2) - (x * newScale);
    const rawY = (h / 2) - (y * newScale);
    const clamped = clampTranslate(rawX, rawY, newScale);
    translateX.current = clamped.x;
    translateY.current = clamped.y;
    scale.current = newScale;
    notifyUpdate();
    if (flyToTimeout.current) clearTimeout(flyToTimeout.current);
    flyToTimeout.current = setTimeout(() => {
      isTransitioning.current = false;
      notifyUpdate();
    }, 800);
  }, [getMinScale, getContainerSize, clampTranslate, notifyUpdate]);

  // Wheel zoom
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.002;
      const computedMinScale = getMinScale();
      let newScale = scale.current * Math.exp(delta);
      newScale = Math.max(computedMinScale, Math.min(newScale, maxScale));

      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const rawX = mouseX - (mouseX - translateX.current) * (newScale / scale.current);
      const rawY = mouseY - (mouseY - translateY.current) * (newScale / scale.current);
      const clamped = clampTranslate(rawX, rawY, newScale);

      translateX.current = clamped.x;
      translateY.current = clamped.y;
      scale.current = newScale;
      notifyUpdate();
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [getMinScale, clampTranslate, maxScale, viewportRef, notifyUpdate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX - translateX.current;
    startY.current = e.clientY - translateY.current;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const rawX = e.clientX - startX.current;
    const rawY = e.clientY - startY.current;
    const clamped = clampTranslate(rawX, rawY, scale.current);
    translateX.current = clamped.x;
    translateY.current = clamped.y;
    notifyUpdate();
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return {
    flyTo,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
    },
  };
}
