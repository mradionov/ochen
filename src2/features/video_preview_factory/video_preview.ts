import type { ImageBitmapRenderSource } from '../renderer/render_source';
import type { Renderer } from '../renderer/renderer';
import type { EffectsStore } from '../renderer/stores/effects_store';
import type { RenderablePlayer } from '../video/renderable_player';

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

  update({ effectsStore }: { effectsStore?: EffectsStore }) {
    if (this.player.isPlaying || !this.player.isDestroyed) {
      const renderSource = this.player.createRenderSource();
      this.renderer.updateFrame({ renderSource, effectsStore });
    } else {
      const renderSource = this.posterRenderSource;
      this.renderer.updateFrame({ renderSource, effectsStore });
    }
  }

  togglePlay() {
    this.player.togglePlay();
  }
}
