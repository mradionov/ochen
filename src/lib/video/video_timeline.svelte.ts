import type { Manifest, VideoClip } from '$lib/manifest/manifest.svelte';
import type { VideoResolver } from './video_resolver';
import { Precondition } from '$lib/precondition';

type VideoId = string;

export type VideoTimelineClip = {
  videoId: VideoId;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  clip: VideoClip;
  start: number;
  end: number;
  sourceDuration: number;
  trimmedDuration: number;
  ratedDuration: number;
  duration: number;
  rate: number;
};

export class VideoTimeline {
  constructor(
    private readonly manifest: Manifest,
    private readonly videoResolver: VideoResolver,
  ) {}

  getClips = $derived(() => this.manifest.videoTrack.clips);

  // get clips() {
  // 	return this.manifest.videoTrack.clips;
  // }

  findClipByTime(time: number): VideoTimelineClip | undefined {
    return this.getTimelineClips().find((timelineClip) => {
      return time >= timelineClip.start && time < timelineClip.end;
    });
  }

  getTimelineClips(): VideoTimelineClip[] {
    return this.getClips().map((clip) => this.getTimelineClip(clip.videoId));
  }

  getClip(id: VideoId): VideoClip {
    return Precondition.checkExists(
      this.getClips().find((clip) => clip.videoId === id),
    );
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
      sourceDuration: this.getSourceDuration(id),
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

  getSourceDuration(id: VideoId): number {
    return this.videoResolver.getMetadata(id).duration;
  }

  getTrimmedDuration(id: VideoId): number {
    const clip = this.getClip(id);
    const duration = this.getSourceDuration(id);
    return duration - (clip.trimEnd ?? 0);
  }

  getRatedDuration(id: VideoId): number {
    const videoMetadata = this.videoResolver.getMetadata(id);
    const duration = videoMetadata.duration;
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
