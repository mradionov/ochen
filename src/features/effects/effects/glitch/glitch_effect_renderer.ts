import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class GlitchEffectRenderer implements EffectRenderer<'glitch'> {
  render({ ctx, width, height }: EffectRendererContext, config: EffectConfig<'glitch'>) {
    const intensity = config.intensity ?? 10;
    const sliceCount = Math.max(2, Math.round(config.sliceCount ?? 10));
    const sliceHeight = Math.ceil(height / sliceCount);

    const imageData = ctx.getImageData(0, 0, width, height);
    const src = new Uint8ClampedArray(imageData.data);
    const dst = imageData.data;

    for (let s = 0; s < sliceCount; s++) {
      if (Math.random() > 0.35) continue; // only shift ~35% of slices

      const shift = Math.round((Math.random() * 2 - 1) * intensity);
      if (shift === 0) continue;

      const y0 = s * sliceHeight;
      const y1 = Math.min(y0 + sliceHeight, height);

      for (let y = y0; y < y1; y++) {
        for (let x = 0; x < width; x++) {
          const srcX = Math.max(0, Math.min(width - 1, x - shift));
          const di = (y * width + x) * 4;
          const si = (y * width + srcX) * 4;
          dst[di]     = src[si];
          dst[di + 1] = src[si + 1];
          dst[di + 2] = src[si + 2];
          dst[di + 3] = src[si + 3];
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
