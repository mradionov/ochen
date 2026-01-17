import type { AudioInfo } from '../../audio_processing/audio_analyser';
import type { GlitchEffectConfig } from '../../effects/effects_store';
import type { EffectRenderer, EffectRendererContext } from '../effect_renderer';

export class GlitchEffectRenderer
  implements EffectRenderer<GlitchEffectConfig>
{
  async render(
    { ctx, width, height }: EffectRendererContext,
    config: GlitchEffectConfig,
    audioInfo?: AudioInfo,
  ) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const { data } = imageData;

    // if (treble > 200 && Math.random() < 0.3) {
    // shift red channel
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i + 4] || data[i]; // sloppy, glitchy on purpose
    }
    // }

    ctx.putImageData(imageData, 0, 0);
  }
}
