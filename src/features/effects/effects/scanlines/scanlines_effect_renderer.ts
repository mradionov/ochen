import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class ScanlinesEffectRenderer implements EffectRenderer<'scanlines'> {
  render({ ctx, width, height }: EffectRendererContext, config: EffectConfig<'scanlines'>) {
    const gap = Math.max(2, Math.round(config.gap ?? 4));
    const opacity = config.opacity ?? 0.5;

    ctx.fillStyle = `rgba(0,0,0,${opacity})`;
    for (let y = 0; y < height; y += gap) {
      ctx.fillRect(0, y, width, 1);
    }
  }
}
