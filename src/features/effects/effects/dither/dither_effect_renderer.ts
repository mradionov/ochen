import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

// Bayer 4×4 ordered dithering matrix (values 0..15, normalised to 0..1)
const BAYER4 = [
   0,  8,  2, 10,
  12,  4, 14,  6,
   3, 11,  1,  9,
  15,  7, 13,  5,
];

export class DitherEffectRenderer implements EffectRenderer<'dither'> {
  render({ ctx, width, height }: EffectRendererContext, _config: EffectConfig<'dither'>) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const d = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const threshold = (BAYER4[(y & 3) * 4 + (x & 3)] / 16) * 255;
        for (let c = 0; c < 3; c++) {
          d[i + c] = d[i + c] > threshold ? 255 : 0;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
