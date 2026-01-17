import { hexToRgb } from '../../../../lib/color';
import type {
  EffectRenderer,
  EffectRendererContext,
} from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class TintEffectRenderer implements EffectRenderer<'tint'> {
  render(
    { ctx, width, height }: EffectRendererContext,
    config: EffectConfig<'tint'>,
  ) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const tintRGB = hexToRgb(config.value);

    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const gray = r * 0.299 + g * 0.587 + b * 0.114;

      data[i] = tintRGB.r * (gray / 255);
      data[i + 1] = (tintRGB.g * gray) / 255;
      data[i + 2] = (tintRGB.b * gray) / 255;
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
