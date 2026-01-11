import { isImage } from '../../lib/image_utils';
import { Precondition } from '../../lib/precondition';
import type { VideoId } from '../manifest/manifest_schema';
import type { ManifestState } from '../manifest/stores/manifest_store';
import type { VideoClipState } from '../manifest/stores/video_clip_store';
import type { VideoResolverSnap } from '../video_resolver/video_resolver_store';

export type VideoTimelineClip = {
  videoId: VideoId;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  clip: VideoClipState;
  start: number;
  end: number;
  customDuration: number;
  fileDuration: number;
  trimmedDuration: number;
  ratedDuration: number;
  duration: number;
  rate: number;
};

export class VideoTimelineSelectors {
  private readonly manifestState: ManifestState;
  private readonly videoResolverSnap: VideoResolverSnap;

  constructor(
    manifestState: ManifestState,
    videoResolverSnap: VideoResolverSnap,
  ) {
    this.manifestState = manifestState;
    this.videoResolverSnap = videoResolverSnap;
  }

  getClips = () => this.manifestState.videoTrack.clips;

  findClipByTime(time: number): VideoTimelineClip | undefined {
    return this.getTimelineClips().find((timelineClip) => {
      return time >= timelineClip.start && time < timelineClip.end;
    });
  }

  getTimelineClips(): VideoTimelineClip[] {
    return this.getClips().map((clip) => this.getTimelineClip(clip.videoId));
  }

  findClip(id: VideoId): VideoClipState | undefined {
    return this.getClips().find((clip) => clip.videoId === id);
  }

  getClip(id: VideoId): VideoClipState {
    return Precondition.checkExists(this.findClip(id));
  }

  getTimelineClip(id: VideoId): VideoTimelineClip {
    return {
      videoId: id,
      clip: this.getClip(id),
      index: this.getIndex(id),
      isFirst: this.isFirst(id),
      isLast: this.isLast(id),
      start: this.getStart(id),
      end: this.getEnd(id),
      customDuration: this.getCustomDuration(id),
      fileDuration: this.getFileDuration(id),
      trimmedDuration: this.getTrimmedDuration(id),
      ratedDuration: this.getRatedDuration(id),
      duration: this.getDuration(id),
      rate: this.getRate(id),
    };
  }

  getIndex(id: VideoId): number {
    return this.getClips().findIndex((clip) => clip.videoId === id);
  }

  isFirst(id: VideoId): boolean {
    const firstClip = this.getClips()[0];
    if (!firstClip) {
      return false;
    }
    return firstClip.videoId === id;
  }

  isLast(id: VideoId): boolean {
    const lastClip = this.getClips()[this.getClips().length - 1];
    if (!lastClip) {
      return false;
    }
    return lastClip.videoId === id;
  }

  getStart(id: VideoId): number {
    let duration = 0;
    for (const clip of this.getClips()) {
      if (clip.videoId === id) {
        break;
      }
      duration += this.getDuration(clip.videoId);
    }
    return duration;
  }

  getEnd(id: VideoId): number {
    const start = this.getStart(id);
    const duration = this.getDuration(id);
    return start + duration;
  }

  getCustomDuration(id: VideoId): number {
    return this.getClip(id).duration ?? 0;
  }

  getFileDuration(id: VideoId): number {
    const clip = this.getClip(id);
    if (isImage(clip.videoPath)) {
      return clip.duration ?? 5;
    }
    return this.videoResolverSnap.getDuration(id);
  }

  getTrimmedDuration(id: VideoId): number {
    const clip = this.getClip(id);
    const duration = this.getCustomDuration(id) || this.getFileDuration(id);
    return duration - (clip.trimEnd ?? 0);
  }

  getRatedDuration(id: VideoId): number {
    const duration = this.getFileDuration(id);
    const rate = this.getRate(id);
    return duration / rate;
  }

  // rated and trimmed
  getDuration(id: VideoId): number {
    const trimmedDuration = this.getTrimmedDuration(id);
    const rate = this.getRate(id);
    return trimmedDuration / rate;
  }

  getRate(id: VideoId): number {
    return this.getClip(id).rate ?? 1;
  }

  getTotalDuration(): number {
    return this.getClips()
      .map((clip) => this.getDuration(clip.videoId))
      .reduce((duration, totalDuration) => {
        return totalDuration + duration;
      }, 0);
  }
}
