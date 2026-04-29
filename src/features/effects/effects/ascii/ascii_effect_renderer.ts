import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

const CHARS = ' `.-\':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@';

export class AsciiEffectRenderer implements EffectRenderer<'ascii'> {
  // Cache measured char width per cell size
  private charWidthCache: Map<number, number> = new Map();

  private getCharWidth(ctx: CanvasRenderingContext2D, cellH: number): number {
    if (this.charWidthCache.has(cellH)) return this.charWidthCache.get(cellH)!;
    ctx.font = `${cellH}px monospace`;
    const w = Math.round(ctx.measureText('M').width);
    this.charWidthCache.set(cellH, w);
    return w;
  }

  render({ ctx, width, height }: EffectRendererContext, config: EffectConfig<'ascii'>) {
    const cellH = Math.max(4, Math.round(config.cellSize ?? 8));
    const cellW = this.getCharWidth(ctx, cellH);

    const { data } = ctx.getImageData(0, 0, width, height);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${cellH}px monospace`;
    ctx.textBaseline = 'top';

    for (let y = 0; y < height; y += cellH) {
      for (let x = 0; x < width; x += cellW) {
        // Average brightness over the cell
        let total = 0, count = 0;
        const yEnd = Math.min(y + cellH, height);
        const xEnd = Math.min(x + cellW, width);
        for (let py = y; py < yEnd; py++) {
          for (let px = x; px < xEnd; px++) {
            const i = (py * width + px) * 4;
            total += (data[i] + data[i + 1] + data[i + 2]) / 3;
            count++;
          }
        }
        const brightness = count > 0 ? total / count / 255 : 0;
        const charIndex = Math.floor(brightness * (CHARS.length - 1));
        const ch = CHARS[charIndex];
        if (ch === ' ') continue;

        // White with brightness-scaled opacity so dim areas aren't invisible
        const alpha = 0.4 + brightness * 0.6;
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
        ctx.fillText(ch, x, y);
      }
    }
  }
}
