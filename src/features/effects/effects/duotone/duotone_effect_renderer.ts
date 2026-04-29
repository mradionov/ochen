import { hexToRgb } from '../../../../lib/color';
import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class DuotoneEffectRenderer implements EffectRenderer<'duotone'> {
  render({ ctx, width, height }: EffectRendererContext, config: EffectConfig<'duotone'>) {
    const shadow = hexToRgb(config.shadowColor ?? '#0a0a4a');
    const highlight = hexToRgb(config.highlightColor ?? '#ff3399');

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const t = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      data[i]     = Math.round(shadow.r + (highlight.r - shadow.r) * t);
      data[i + 1] = Math.round(shadow.g + (highlight.g - shadow.g) * t);
      data[i + 2] = Math.round(shadow.b + (highlight.b - shadow.b) * t);
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
