import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class InvertEffectRenderer implements EffectRenderer<'invert'> {
  render({ ctx, width, height }: EffectRendererContext, _config: EffectConfig<'invert'>) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    ctx.putImageData(imageData, 0, 0);
  }
}
