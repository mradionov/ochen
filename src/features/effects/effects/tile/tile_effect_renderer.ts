import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class TileEffectRenderer implements EffectRenderer<'tile'> {
  private offscreen: OffscreenCanvas | null = null;
  private offCtx: OffscreenCanvasRenderingContext2D | null = null;

  render({ ctx, width, height }: EffectRendererContext, config: EffectConfig<'tile'>) {
    const cols = Math.max(1, Math.round(config.cols ?? 2));
    const rows = Math.max(1, Math.round(config.rows ?? 2));

    if (!this.offscreen || this.offscreen.width !== width || this.offscreen.height !== height) {
      this.offscreen = new OffscreenCanvas(width, height);
      this.offCtx = this.offscreen.getContext('2d');
    }
    if (!this.offCtx) return;

    this.offCtx.drawImage(ctx.canvas, 0, 0);

    const tileW = width / cols;
    const tileH = height / rows;

    ctx.clearRect(0, 0, width, height);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        ctx.drawImage(this.offscreen, col * tileW, row * tileH, tileW, tileH);
      }
    }
  }
}
