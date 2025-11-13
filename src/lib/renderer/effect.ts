import type { AudioInfo } from '$lib/audio/audio_analyser';

export type EffectContext = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
};

export interface Effect<T> {
  apply(
    context: EffectContext,
    config: T,
    audioInfo?: AudioInfo,
  ): void | Promise<void>;
}
