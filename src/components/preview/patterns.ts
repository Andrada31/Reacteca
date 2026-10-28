import type { PreviewBackground, PreviewOptions } from '@/registry';

/** Utility classes for each canvas background (defined in src/index.css). */
export const patternClass: Record<PreviewBackground, string> = {
  grid: 'canvas-grid',
  dots: 'canvas-dots',
  plain: '',
};

/** How the demo sits in the canvas, per `meta.preview.layout`. */
export const layoutClass: Record<NonNullable<PreviewOptions['layout']>, string> = {
  centered: 'items-center justify-center px-6 py-12',
  padded: 'p-8 *:w-full',
  fullscreen: '*:w-full *:flex-1',
};
