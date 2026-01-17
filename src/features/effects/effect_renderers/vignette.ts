import type { EffectRenderer, EffectRendererContext } from '../effect_renderer';

export class VignetteEffectRenderer implements EffectRenderer<void> {
  render({ ctx, width, height }: EffectRendererContext) {
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width / 4,
      width / 2,
      height / 2,
      width / 1.2,
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}
