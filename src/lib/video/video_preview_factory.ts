import { TaskQueue } from '$lib/task_queue';
import type { VideoResolver } from '$lib/video/video_resolver';
import type { VideoTimelineClip } from '$lib/video/video_timeline.svelte';
import { VideoPlayer } from '$lib/video/video_player';
import {
  ImageBitmapSource,
  VideoImageSource,
  VideoRenderer,
} from '$lib/video/video_renderer';
import type { VideoEffects } from '$lib/manifest/manifest.svelte';

export class VideoPreview {
  constructor(
    readonly player: VideoPlayer,
    readonly renderer: VideoRenderer,
    readonly posterImageSource: ImageBitmapSource,
  ) {}

  update({ effects }: { effects?: VideoEffects }) {
    if (this.player.isPlaying || !this.player.isDestroyed) {
      const imageSource = new VideoImageSource(this.player.element);
      this.renderer.updateFrame({ imageSource, effects }, undefined);
    } else {
      const imageSource = this.posterImageSource;
      this.renderer.updateFrame({ imageSource, effects }, undefined);
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
      const player = new VideoPlayer(videoPath, {
        rate: 10,
        trimmedDuration,
      });

      const renderer = VideoRenderer.createFromSize({
        width: 200,
        height: 200,
      });

      // TODO: can just wait for load metadata?
      await player.play();
      player.pause();

      // TODO: why is it stretched if I don't resize
      // TODO: should I save this poster when loading metadata?
      const posterFrame = await createImageBitmap(
        player.element,
        0,
        0,
        player.element.videoWidth,
        player.element.videoHeight,
        {
          resizeQuality: 'high',
          resizeWidth: player.element.videoWidth,
          resizeHeight: player.element.videoHeight,
        },
      );
      const posterSource = new ImageBitmapSource(posterFrame);

      renderer.updateFrame({ imageSource: posterSource }, undefined);

      // Free up video resources for next players, as they only need canvases with posters
      player.destroy();

      return new VideoPreview(player, renderer, posterSource);
    });
  }
}
