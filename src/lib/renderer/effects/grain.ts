import type { AudioInfo } from '$lib/audio/audio_analyser';
import type { Effect, EffectContext } from '../effect';
import type { GrainEffectConfig } from '../effects_map.svelte';

export class GrainEffect implements Effect<GrainEffectConfig> {
  apply(
    { ctx, width, height }: EffectContext,
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
