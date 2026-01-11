import type { ImageBitmapRenderSource } from '../renderer/render_source';
import type { Renderer } from '../renderer/renderer';
import type { EffectsState } from '../renderer/effects_store';
import type { RenderablePlayer } from '../video_player/renderable_player';

export class VideoPreview {
  readonly player: RenderablePlayer;
  readonly renderer: Renderer;
  readonly posterRenderSource: ImageBitmapRenderSource;

  constructor(
    player: RenderablePlayer,
    renderer: Renderer,
    posterRenderSource: ImageBitmapRenderSource,
  ) {
    this.player = player;
    this.renderer = renderer;
    this.posterRenderSource = posterRenderSource;
  }

  update({
    lastTime,
    effectsState,
  }: {
    lastTime: number;
    effectsState?: EffectsState;
  }) {
    if (this.player.isPlaying || !this.player.isDestroyed) {
      const renderSource = this.player.createRenderSource();
      this.renderer.updateFrame({ renderSource, lastTime, effectsState });
    } else {
      const renderSource = this.posterRenderSource;
      this.renderer.updateFrame({ renderSource, lastTime, effectsState });
    }
  }

  togglePlay() {
    this.player.togglePlay();
  }
}
