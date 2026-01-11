import { TaskQueue } from '../../lib/task_queue';
import { ImageBitmapRenderSource } from '../renderer/render_source';
import { Renderer } from '../renderer/renderer';
import { RenderablePlayerFactory } from '../video_player/renderable_player_factory';
import { VideoPreview } from './video_preview';

export class VideoPreviewFactory {
  // Create one by one to speed up the process, video elements are struggling if it's done at the same time
  private taskQueue = new TaskQueue();

  private cache = new Map<string, Promise<VideoPreview>>();

  async create(
    videoPath: string,
    { trimmedDuration }: { trimmedDuration?: number } = {},
  ): Promise<VideoPreview> {
    const cacheKey = videoPath;

    let videoPreviewPromise = this.cache.get(cacheKey);
    if (videoPreviewPromise != null) {
      return videoPreviewPromise;
    }

    videoPreviewPromise = this.doCreate(videoPath, { trimmedDuration });
    this.cache.set(cacheKey, videoPreviewPromise);

    return videoPreviewPromise;
  }

  private doCreate(
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

      renderer.updateFrame({ renderSource: posterSource });

      // Free up video resources for next players, as they only need canvases with posters
      player.destroy();

      return new VideoPreview(player, renderer, posterSource);
    });
  }
}
