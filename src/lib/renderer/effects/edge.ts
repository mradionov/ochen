import type { Effect, EffectContext } from '../effect';

type EdgeEffectConfig = {
  kernel?: 'prewitt' | 'laplacian' | 'sobel';
  threshold?: number;
};

export class EdgeEffect implements Effect<EdgeEffectConfig> {
  apply({ ctx, width, height }: EffectContext, config: EdgeEffectConfig = {}) {
    const imageData = ctx.getImageData(0, 0, width, height);

    const { data } = imageData;

    const srcData = data;

    const gray = new Uint8ClampedArray(width * height);
    for (let i = 0; i < width * height; i++) {
      const r = srcData[i * 4];
      const g = srcData[i * 4 + 1];
      const b = srcData[i * 4 + 2];
      gray[i] = 0.3 * r + 0.59 * g + 0.11 * b;
    }

    let gx, gy;
    switch (config.kernel) {
      case 'prewitt':
        gx = [-1, 0, 1, -1, 0, 1, -1, 0, 1];
        gy = [-1, -1, -1, 0, 0, 0, 1, 1, 1];
        break;
      case 'laplacian':
        gx = [0, 1, 0, 1, -4, 1, 0, 1, 0];
        gy = [0, 1, 0, 1, -4, 1, 0, 1, 0];
        break;
      case 'sobel':
      default:
        gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    }

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let px = 0,
          py = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const val = gray[(y + ky) * width + (x + kx)];
            const k = (ky + 1) * 3 + (kx + 1);
            px += gx[k] * val;
            py += gy[k] * val;
          }
        }
        let mag = Math.sqrt(px * px + py * py);
        if (config.threshold != null) {
          mag = mag > config.threshold ? mag : 0;
        }
        const i = (y * width + x) * 4;
        data[i] = data[i + 1] = data[i + 2] = mag;
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
