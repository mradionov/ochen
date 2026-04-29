import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class PixelateEffectRenderer implements EffectRenderer<'pixelate'> {
  render({ ctx, width, height }: EffectRendererContext, config: EffectConfig<'pixelate'>) {
    const blockSize = Math.max(2, Math.round(config.blockSize ?? 16));

    const { data } = ctx.getImageData(0, 0, width, height);

    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        const bw = Math.min(blockSize, width - x);
        const bh = Math.min(blockSize, height - y);

        let r = 0, g = 0, b = 0;
        for (let dy = 0; dy < bh; dy++) {
          for (let dx = 0; dx < bw; dx++) {
            const i = ((y + dy) * width + (x + dx)) * 4;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
          }
        }
        const count = bw * bh;
        ctx.fillStyle = `rgb(${r / count | 0},${g / count | 0},${b / count | 0})`;
        ctx.fillRect(x, y, bw, bh);
      }
    }
  }
}
