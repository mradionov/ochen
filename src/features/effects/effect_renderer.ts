// import type { AudioInfo } from '$lib/audio/audio_analyser';

export type EffectRendererContext = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  lastTime: number;
};

export interface EffectRenderer<T> {
  render(
    context: EffectRendererContext,
    config: T,
    // audioInfo?: AudioInfo,
  ): void | Promise<void>;
}
