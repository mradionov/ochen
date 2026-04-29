import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class PosterizeEffectRenderer implements EffectRenderer<'posterize'> {
  render({ ctx, width, height }: EffectRendererContext, config: EffectConfig<'posterize'>) {
    const levels = Math.max(2, Math.round(config.levels ?? 4));
    const step = 255 / (levels - 1);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i]     = Math.round(data[i]     / step) * step;
      data[i + 1] = Math.round(data[i + 1] / step) * step;
      data[i + 2] = Math.round(data[i + 2] / step) * step;
    }
    ctx.putImageData(imageData, 0, 0);
  }
}
