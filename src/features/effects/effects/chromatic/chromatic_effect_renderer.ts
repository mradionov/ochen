import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class ChromaticEffectRenderer implements EffectRenderer<'chromatic'> {
  render({ ctx, width, height }: EffectRendererContext, config: EffectConfig<'chromatic'>) {
    const offset = Math.round(config.offset ?? 8);

    const imageData = ctx.getImageData(0, 0, width, height);
    const src = new Uint8ClampedArray(imageData.data);
    const dst = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;

        const rxSrc = Math.max(0, x - offset);
        const bxSrc = Math.min(width - 1, x + offset);

        dst[i]     = src[(y * width + rxSrc) * 4];      // R shifted left
        dst[i + 1] = src[i + 1];                         // G unchanged
        dst[i + 2] = src[(y * width + bxSrc) * 4 + 2];  // B shifted right
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
