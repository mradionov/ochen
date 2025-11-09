import { hexToRgb } from '$lib/color';
import type { Effect, EffectContext } from '../effect';

export class TintEffect implements Effect<string> {
  apply({ ctx, width, height }: EffectContext, tint: string) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const tintRGB = hexToRgb(tint);

    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const gray = r * 0.299 + g * 0.587 + b * 0.114;

      data[i] = tintRGB.r * (gray / 255);
      data[i + 1] = (tintRGB.g * gray) / 255;
      data[i + 2] = (tintRGB.b * gray) / 255;
    }

    ctx.putImageData(imageData, 0, 0);
  }
}
