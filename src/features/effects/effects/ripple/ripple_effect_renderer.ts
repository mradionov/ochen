import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class RippleEffectRenderer implements EffectRenderer<'ripple'> {
  private offscreen: OffscreenCanvas | null = null;

  render({ ctx, width, height, lastTime }: EffectRendererContext, config: EffectConfig<'ripple'>) {
    const amplitude = config.amplitude ?? 8;
    const frequency = config.frequency ?? 0.04;
    const t = lastTime * 0.001; // seconds

    if (!this.offscreen || this.offscreen.width !== width || this.offscreen.height !== height) {
      this.offscreen = new OffscreenCanvas(width, height);
    }
    const offCtx = this.offscreen.getContext('2d')!;
    offCtx.drawImage(ctx.canvas, 0, 0);

    const src = offCtx.getImageData(0, 0, width, height);
    const dst = ctx.getImageData(0, 0, width, height);
    const s = src.data;
    const d = dst.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const sx = Math.round(x + amplitude * Math.sin(y * frequency + t * 3));
        const sy = Math.round(y + amplitude * Math.sin(x * frequency + t * 2));

        const clampedX = Math.max(0, Math.min(width - 1, sx));
        const clampedY = Math.max(0, Math.min(height - 1, sy));

        const si = (clampedY * width + clampedX) * 4;
        const di = (y * width + x) * 4;
        d[di]     = s[si];
        d[di + 1] = s[si + 1];
        d[di + 2] = s[si + 2];
        d[di + 3] = s[si + 3];
      }
    }

    ctx.putImageData(dst, 0, 0);
  }
}
