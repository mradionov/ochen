import { isImage } from '../../lib/image_utils';
import { ImagePlayer } from './image_player';
import type { RenderablePlayer } from './renderable_player';
import { VideoPlayer } from './video_player';

export class RenderablePlayerFactory {
  // static createFromTimelineClip(
  //   timelineClip: VideoTimelineClip,
  // ): RenderablePlayer {
  //   if (timelineClip.clip.isImage()) {
  //     return ImagePlayer.createFromPath(
  //       timelineClip.clip.videoPath,
  //       timelineClip.clip.duration ?? 5,
  //     );
  //   }
  //   return VideoPlayer.createFromTimelineClip(timelineClip);
  // }

  static createFromPath(
    path: string,
    { rate, trimmedDuration }: { rate?: number; trimmedDuration?: number } = {},
  ): RenderablePlayer {
    if (isImage(path)) {
      return ImagePlayer.createFromPath(path, trimmedDuration ?? 5);
    }
    return VideoPlayer.createFromPath(path, {
      rate,
      trimmedDuration,
    });
  }
}
