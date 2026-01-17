import type { AudioInfo } from '../../audio_processing/audio_analyser';
import type { GrainEffectConfig } from '../../effects/effects_store';
import type { EffectRenderer, EffectRendererContext } from '../effect_renderer';

export class GrainEffectRenderer implements EffectRenderer<GrainEffectConfig> {
  render(
    { ctx, width, height }: EffectRendererContext,
    config: GrainEffectConfig,
    audioInfo?: AudioInfo,
  ) {
    let intensity = config.intensity ?? 0;
    if (audioInfo?.isBeat) {
      intensity *= 1.5;
    }

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const rand = (Math.random() - 0.5) * intensity;
      data[i] += rand; // R
      data[i + 1] += rand; // G
      data[i + 2] += rand; // B
    }
    ctx.putImageData(imageData, 0, 0);
  }
}
