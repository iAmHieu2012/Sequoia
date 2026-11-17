/** Side length of the square map world in px. */
export const CANVAS_SIZE = 20000;

/**
 * Stored node x/y are centered on 0; add OFFSET to get world coordinates in [0, CANVAS_SIZE]
 * (what usePanZoom's flyTo takes and where nodes are positioned in the DOM).
 */
export const OFFSET = CANVAS_SIZE / 2;
