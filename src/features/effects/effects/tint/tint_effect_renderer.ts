import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class TintEffectRenderer implements EffectRenderer<'tint'> {
  render(
    { ctx, width, height }: EffectRendererContext,
    config: EffectConfig<'tint'>,
  ) {
    // "color" blend mode applies the tint's hue+saturation while preserving
    // the backdrop's luminosity — colorizes without darkening dark pixels.
    const prev = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = config.value;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = prev;
  }
}
