import { isImage } from '../../lib/image_utils';
import { Precondition } from '../../lib/precondition';
import type { VideoId } from '../manifest/manifest_schema';
import type { ManifestState } from '../manifest/stores/manifest_store';
import type { VideoClipState } from '../manifest/stores/video_clip_store';
import type { VideoResolver } from '../video_resolver/video_resolver';

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

export class VideoTimeline {
  private readonly videoResolver: VideoResolver;

  constructor(videoResolver: VideoResolver) {
    this.videoResolver = videoResolver;
  }

  getClips = (manifestState: ManifestState) => manifestState.videoTrack.clips;

  findClipByTime(
    manifestState: ManifestState,
    time: number,
  ): VideoTimelineClip | undefined {
    return this.getTimelineClips(manifestState).find((timelineClip) => {
      return time >= timelineClip.start && time < timelineClip.end;
    });
  }

  getTimelineClips(manifestState: ManifestState): VideoTimelineClip[] {
    return this.getClips(manifestState).map((clip) =>
      this.getTimelineClip(manifestState, clip.videoId),
    );
  }

  findClip(
    manifestState: ManifestState,
    id: VideoId,
  ): VideoClipState | undefined {
    return this.getClips(manifestState).find((clip) => clip.videoId === id);
  }

  getClip(manifestState: ManifestState, id: VideoId): VideoClipState {
    return Precondition.checkExists(this.findClip(manifestState, id));
  }

  getTimelineClip(
    manifestState: ManifestState,
    id: VideoId,
  ): VideoTimelineClip {
    return {
      videoId: id,
      clip: this.getClip(manifestState, id),
      index: this.getIndex(manifestState, id),
      isFirst: this.isFirst(manifestState, id),
      isLast: this.isLast(manifestState, id),
      start: this.getStart(manifestState, id),
      end: this.getEnd(manifestState, id),
      customDuration: this.getCustomDuration(manifestState, id),
      fileDuration: this.getFileDuration(manifestState, id),
      trimmedDuration: this.getTrimmedDuration(manifestState, id),
      ratedDuration: this.getRatedDuration(manifestState, id),
      duration: this.getDuration(manifestState, id),
      rate: this.getRate(manifestState, id),
    };
  }

  getIndex(manifestState: ManifestState, id: VideoId): number {
    return this.getClips(manifestState).findIndex(
      (clip) => clip.videoId === id,
    );
  }

  isFirst(manifestState: ManifestState, id: VideoId): boolean {
    const firstClip = this.getClips(manifestState)[0];
    if (!firstClip) {
      return false;
    }
    return firstClip.videoId === id;
  }

  isLast(manifestState: ManifestState, id: VideoId): boolean {
    const lastClip =
      this.getClips(manifestState)[this.getClips(manifestState).length - 1];
    if (!lastClip) {
      return false;
    }
    return lastClip.videoId === id;
  }

  getStart(manifestState: ManifestState, id: VideoId): number {
    let duration = 0;
    for (const clip of this.getClips(manifestState)) {
      if (clip.videoId === id) {
        break;
      }
      duration += this.getDuration(manifestState, clip.videoId);
    }
    return duration;
  }

  getEnd(manifestState: ManifestState, id: VideoId): number {
    const start = this.getStart(manifestState, id);
    const duration = this.getDuration(manifestState, id);
    return start + duration;
  }

  getCustomDuration(manifestState: ManifestState, id: VideoId): number {
    return this.getClip(manifestState, id).duration ?? 0;
  }

  getFileDuration(manifestState: ManifestState, id: VideoId): number {
    const clip = this.getClip(manifestState, id);
    if (isImage(clip.videoPath)) {
      return clip.duration ?? 5;
    }
    return this.videoResolver.getMetadata(id).duration;
  }

  getTrimmedDuration(manifestState: ManifestState, id: VideoId): number {
    const clip = this.getClip(manifestState, id);
    const duration =
      this.getCustomDuration(manifestState, id) ||
      this.getFileDuration(manifestState, id);
    return duration - (clip.trimEnd ?? 0);
  }

  getRatedDuration(manifestState: ManifestState, id: VideoId): number {
    const duration = this.getFileDuration(manifestState, id);
    const rate = this.getRate(manifestState, id);
    return duration / rate;
  }

  // rated and trimmed
  getDuration(manifestState: ManifestState, id: VideoId): number {
    const trimmedDuration = this.getTrimmedDuration(manifestState, id);
    const rate = this.getRate(manifestState, id);
    return trimmedDuration / rate;
  }

  getRate(manifestState: ManifestState, id: VideoId): number {
    return this.getClip(manifestState, id).rate ?? 1;
  }

  getTotalDuration(manifestState: ManifestState): number {
    return this.getClips(manifestState)
      .map((clip) => this.getDuration(manifestState, clip.videoId))
      .reduce((duration, totalDuration) => {
        return totalDuration + duration;
      }, 0);
  }
}
