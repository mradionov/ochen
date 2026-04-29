import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class GhostEffectRenderer implements EffectRenderer<'ghost'> {
  private trail: OffscreenCanvas | null = null;

  render({ ctx, width, height }: EffectRendererContext, config: EffectConfig<'ghost'>) {
    const decay = config.decay ?? 0.5;

    if (!this.trail || this.trail.width !== width || this.trail.height !== height) {
      this.trail = new OffscreenCanvas(width, height);
    }

    const trailCtx = this.trail.getContext('2d')!;

    // Fade trail by drawing semi-transparent black over it
    trailCtx.globalAlpha = 1 - decay;
    trailCtx.fillStyle = 'black';
    trailCtx.fillRect(0, 0, width, height);
    trailCtx.globalAlpha = 1;

    // Stamp current frame onto trail
    trailCtx.drawImage(ctx.canvas, 0, 0);

    // Overlay trail on current canvas
    ctx.drawImage(this.trail, 0, 0);
  }
}
