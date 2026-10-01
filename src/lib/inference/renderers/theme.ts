/**
 * Shared UI Theme for Playground Inference Renderers.
 * Centralizes all color codes and visual tokens to ensure consistency.
 */
export const RENDERER_THEME = {
  colors: {
    coral: '#AE4949',
    teal: '#49AEAE',
    textBg: 'rgba(0, 0, 0, 0.7)',
  },
  
  // Hex/String format for Canvas draw operations
  segmentationColors: [
    '#f14949', // red
    '#49f149', // green
    '#4949f1', // blue
    '#f1f149', // yellow
    '#f149f1', // pink
    '#49f1f1', // cyan
    '#f19d49', // orange
    '#49f19d', // turquoise
    '#9d49f1', // purple
    '#808080'  // grey
  ],

  // RGB Array format for direct ImageData pixel manipulation
  segmentationColorsRGB: [
    [241, 73, 73],   // red
    [73, 241, 73],   // green
    [73, 73, 241],   // blue
    [241, 241, 73],  // yellow
    [241, 73, 241],  // pink
    [73, 241, 241],  // cyan
    [241, 157, 73],  // orange
    [73, 241, 157],  // turquoise
    [157, 73, 241],  // purple
    [128, 128, 128]  // grey
  ]
};
