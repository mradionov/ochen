import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class ChannelSwapEffectRenderer implements EffectRenderer<'channelSwap'> {
  render({ ctx, width, height }: EffectRendererContext, _config: EffectConfig<'channelSwap'>) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      d[i]     = g;
      d[i + 1] = b;
      d[i + 2] = r;
    }
    ctx.putImageData(imageData, 0, 0);
  }
}
