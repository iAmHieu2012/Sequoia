/**
 * Shared UI Theme for Playground Inference Renderers.
 * Centralizes all color codes and visual tokens to ensure consistency.
 */
export const RENDERER_THEME = {
  colors: {
    coral: '#AE4949',
    teal: '#49AEAE',
    tealTranslucent: 'rgba(73, 174, 174, 0.3)',
    textBg: 'rgba(0, 0, 0, 0.7)',
  },
  
  // Hex/String format for Canvas draw operations
  segmentationColors: [
    '#49AEAE', // Teal
    '#AE4949', // Coral
    '#49F19D', // Turquoise
    '#F19D49', // Orange
    '#9D49F1'  // Purple
  ],

  // RGB Array format for direct ImageData pixel manipulation
  segmentationColorsRGB: [
    [73, 174, 174],  // Class 1 (Teal)
    [255, 80, 80],   // Class 2 (Coral)
    [0, 255, 153],   // Class 3 (Turquoise)
    [255, 153, 0],   // Class 4 (Orange)
    [153, 0, 255]    // Class 5 (Purple)
  ]
};
