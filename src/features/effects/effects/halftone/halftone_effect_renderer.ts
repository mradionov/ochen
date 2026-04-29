import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class HalftoneEffectRenderer implements EffectRenderer<'halftone'> {
  render({ ctx, width, height }: EffectRendererContext, config: EffectConfig<'halftone'>) {
    const cell = Math.max(4, Math.round(config.cellSize ?? 8));

    const { data } = ctx.getImageData(0, 0, width, height);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    const halfCell = cell / 2;

    for (let y = 0; y < height; y += cell) {
      for (let x = 0; x < width; x += cell) {
        const i = (y * width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const brightness = (r + g + b) / 765; // 0..1
        const radius = halfCell * brightness;

        ctx.beginPath();
        ctx.arc(x + halfCell, y + halfCell, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fill();
      }
    }
  }
}
