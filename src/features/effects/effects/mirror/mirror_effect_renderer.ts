import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class MirrorEffectRenderer implements EffectRenderer<'mirror'> {
  private offscreen: OffscreenCanvas | null = null;

  render({ ctx, width, height }: EffectRendererContext, _config: EffectConfig<'mirror'>) {
    const half = Math.floor(width / 2);

    if (!this.offscreen || this.offscreen.width !== half || this.offscreen.height !== height) {
      this.offscreen = new OffscreenCanvas(half, height);
    }

    const offCtx = this.offscreen.getContext('2d')!;
    offCtx.drawImage(ctx.canvas, 0, 0, half, height, 0, 0, half, height);

    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(this.offscreen, -width, 0, half, height);
    ctx.restore();
  }
}
