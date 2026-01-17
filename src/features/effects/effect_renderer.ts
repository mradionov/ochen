// import type { AudioInfo } from '$lib/audio/audio_analyser';
import type { EffectConfig, EffectType } from './effects_schema';

export type EffectRendererContext = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  lastTime: number;
};

export interface EffectRenderer<T extends EffectType> {
  render(
    context: EffectRendererContext,
    config: EffectConfig<T>,
    // audioInfo?: AudioInfo,
  ): void | Promise<void>;
}
