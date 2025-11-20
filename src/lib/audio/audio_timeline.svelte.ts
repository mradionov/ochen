import type { AudioResolver } from '$lib/audio/audio_resolver';
import type { Manifest, AudioClip } from '$lib/manifest/manifest.svelte';
import { Precondition } from '$lib/precondition';

type AudioId = string;

export type AudioTimelineClip = {
  audioId: AudioId;
  clip: AudioClip;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  start: number;
  end: number;
  sourceDuration: number;
  trimmedDuration: number;
  duration: number;
};

export class AudioTimeline {
  constructor(
    private readonly manifest: Manifest,
    private readonly audioResolver: AudioResolver,
  ) {}

  getClips = $derived(() => this.manifest.audioTrack.clips);

  findClipByTime(time: number): AudioTimelineClip | undefined {
    return this.getTimelineClips().find((timelineClip) => {
      return time >= timelineClip.start && time < timelineClip.end;
    });
  }

  getTimelineClips(): AudioTimelineClip[] {
    return this.getClips().map((clip) => this.getTimelineClip(clip.audioId));
  }

  getClip(id: AudioId): AudioClip {
    return Precondition.checkExists(
      this.getClips().find((clip) => clip.audioId === id),
    );
  }

  getTimelineClip(id: AudioId): AudioTimelineClip {
    return {
      audioId: id,
      clip: this.getClip(id),
      index: this.getIndex(id),
      isFirst: this.isFirst(id),
      isLast: this.isLast(id),
      start: this.getStart(id),
      end: this.getEnd(id),
      sourceDuration: this.getSourceDuration(id),
      trimmedDuration: this.getTrimmedDuration(id),
      duration: this.getDuration(id),
    };
  }

  getIndex(id: AudioId): number {
    return this.getClips().findIndex((clip) => clip.audioId === id);
  }

  isFirst(id: AudioId): boolean {
    const firstClip = this.getClips()[0];
    if (!firstClip) {
      return false;
    }
    return firstClip.audioId === id;
  }

  isLast(id: AudioId): boolean {
    const lastClip = this.getClips()[this.getClips().length - 1];
    if (!lastClip) {
      return false;
    }
    return lastClip.audioId === id;
  }

  getStart(id: AudioId): number {
    let duration = 0;
    for (const clip of this.getClips()) {
      if (clip.audioId === id) {
        break;
      }
      duration += this.getDuration(clip.audioId);
    }
    return duration;
  }

  getEnd(id: AudioId): number {
    const start = this.getStart(id);
    const duration = this.getDuration(id);
    return start + duration;
  }

  getSourceDuration(id: AudioId): number {
    return this.audioResolver.getMetadata(id).duration;
  }

  getTrimmedDuration(id: AudioId): number {
    const clip = this.getClip(id);
    const duration = this.getSourceDuration(id);
    return duration - (clip.trimEnd ?? 0);
  }

  // trimmed
  getDuration(id: AudioId): number {
    return this.getTrimmedDuration(id);
  }

  getTotalDuration(): number {
    return this.getClips()
      .map((clip) => this.getDuration(clip.audioId))
      .reduce((duration, totalDuration) => {
        return totalDuration + duration;
      }, 0);
  }
}
