/** Colors shared by the playground parsers and renderers. */
export const RENDERER_THEME = {
  colors: {
    coral: '#AE4949',
    teal: '#49AEAE',
    textBg: 'rgba(0, 0, 0, 0.7)',
  },
  
  // Class colors, as RGB for writing ImageData pixels directly.
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
