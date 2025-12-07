import { TaskQueue } from '$lib/task_queue';
import { Renderer } from '$lib/renderer/renderer';
import { ImageBitmapRenderSource } from '$lib/renderer/render_source';
import type { EffectsMap } from '$lib/renderer/effects_map.svelte';
import { RenderablePlayerFactory } from './renderable_player_factory';
import type { RenderablePlayer } from './renderable_player';

export class VideoPreview {
  constructor(
    readonly player: RenderablePlayer,
    readonly renderer: Renderer,
    readonly posterRenderSource: ImageBitmapRenderSource,
  ) {}

  update({ effects }: { effects?: EffectsMap }) {
    if (this.player.isPlaying || !this.player.isDestroyed) {
      const renderSource = this.player.createRenderSource();
      this.renderer.updateFrame({ renderSource, effects }, undefined);
    } else {
      const renderSource = this.posterRenderSource;
      this.renderer.updateFrame({ renderSource, effects }, undefined);
    }
  }

  togglePlay() {
    this.player.togglePlay();
  }
}

export class VideoPreviewFactory {
  // Create one by one to speed up the process, video elements are struggling if it's done at the same time
  private taskQueue = new TaskQueue();

  create(
    videoPath: string,
    { trimmedDuration }: { trimmedDuration?: number } = {},
  ): Promise<VideoPreview> {
    return this.taskQueue.run(async () => {
      const player = RenderablePlayerFactory.createFromPath(videoPath, {
        rate: 10,
        trimmedDuration,
      });

      const renderer = Renderer.createFromSize({
        width: 200,
        height: 200,
      });

      // TODO: can just wait for load metadata?
      await player.loaded;
      await player.play();
      player.pause();

      // TODO: why is it stretched if I don't resize
      // TODO: should I save this poster when loading metadata?
      const posterFrame = await createImageBitmap(
        player.element,
        0,
        0,
        player.width,
        player.height,
        {
          resizeQuality: 'high',
          resizeWidth: player.width,
          resizeHeight: player.height,
        },
      );
      const posterSource = new ImageBitmapRenderSource(posterFrame);

      renderer.updateFrame({ renderSource: posterSource }, undefined);

      // Free up video resources for next players, as they only need canvases with posters
      player.destroy();

      return new VideoPreview(player, renderer, posterSource);
    });
  }
}
