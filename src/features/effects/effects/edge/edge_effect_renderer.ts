import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class EdgeEffectRenderer implements EffectRenderer<'edge'> {
  private offscreen: OffscreenCanvas | null = null;

  render({ ctx, width, height }: EffectRendererContext, config: EffectConfig<'edge'>) {
    const threshold = config.threshold ?? 0;
    const transparency = config.transparency ?? 255;
    const strength = config.strength ?? 1;

    const imageData = ctx.getImageData(0, 0, width, height);
    const src = imageData.data;

    const gray = new Uint8ClampedArray(width * height);
    for (let i = 0; i < width * height; i++) {
      gray[i] = (src[i * 4] + src[i * 4 + 1] + src[i * 4 + 2]) / 3;
    }

    const dst = new Uint8ClampedArray(src.length);
    const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let px = 0, py = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const val = gray[(y + ky) * width + (x + kx)];
            const k = (ky + 1) * 3 + (kx + 1);
            px += gx[k] * val;
            py += gy[k] * val;
          }
        }
        const mag = Math.hypot(px, py) * strength;
        if (mag > threshold) {
          const i = (y * width + x) * 4;
          const intensity = Math.min(255, mag);
          dst[i]     = intensity;
          dst[i + 1] = intensity;
          dst[i + 2] = intensity;
          dst[i + 3] = transparency;
        }
      }
    }

    // Composite edge layer on top (preserves alpha of non-edge pixels)
    if (!this.offscreen || this.offscreen.width !== width || this.offscreen.height !== height) {
      this.offscreen = new OffscreenCanvas(width, height);
    }
    const offCtx = this.offscreen.getContext('2d')!;
    offCtx.putImageData(new ImageData(dst, width, height), 0, 0);
    ctx.drawImage(this.offscreen, 0, 0);
  }
}
