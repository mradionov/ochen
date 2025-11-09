import { Subject } from '$lib/subject';
import { defaults } from '$lib/defaults';
import type { VideoTimelineClip } from './video_timeline.svelte';

type VideoPlayerOptions = {
  rate?: number;
  trimmedDuration?: number;
};

const defaultOptions: VideoPlayerOptions = {
  rate: 1,
  trimmedDuration: undefined,
};

export class VideoPlayer {
  readonly element: HTMLVideoElement;
  readonly options: VideoPlayerOptions;
  readonly ended = new Subject<void>();
  private _isPlaying = false;
  private _isDestroyed = false;

  constructor(
    private readonly path: string,
    argOptions: VideoPlayerOptions = {},
  ) {
    this.options = defaults(defaultOptions, argOptions);

    this.element = document.createElement('video');
    this.load();
  }

  static createFromTimelineClip(timelineClip: VideoTimelineClip) {
    return new VideoPlayer(timelineClip.clip.videoPath, {
      trimmedDuration: timelineClip.trimmedDuration,
      rate: timelineClip.rate,
    });
  }

  get isPlaying() {
    return this._isPlaying;
  }

  get isDestroyed() {
    return this._isDestroyed;
  }

  async play() {
    if (this.isDestroyed) {
      this.load();
      this._isDestroyed = false;
    }

    if (this._isPlaying) {
      return;
    }
    this._isPlaying = true;
    await this.element.play();
  }

  pause() {
    if (!this._isPlaying) {
      return;
    }
    this._isPlaying = false;
    this.element.pause();
  }

  async togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      await this.play();
    }
  }

  seek(time: number) {
    this.element.currentTime = time * (this.options.rate ?? 1);
  }

  updateFrame() {
    if (!this.isPlaying) return;

    const duration = this.options.trimmedDuration ?? this.element.duration;
    if (this.element.currentTime > duration) {
      this._isPlaying = false;
      this.ended.emit();
      this.destroy();
    }
  }

  destroy() {
    this._isDestroyed = true;
    this.element.removeAttribute('src'); // empty source
    this.element.load();
    this.element.removeEventListener('ended', this.onElementEnded);
    this.ended.removeAllListeners();
    this._isPlaying = false;
  }

  // private get rate() {
  // 	return this.timelineClip.rate;
  // }

  private load() {
    this.element.src = this.path;
    this.element.muted = true;
    this.element.playbackRate = this.options.rate ?? 1;
    this.element.currentTime = 0.01;
    this.element.addEventListener('ended', this.onElementEnded);
  }

  private onElementEnded = () => {
    this.ended.emit();
    this._isPlaying = false;
  };
}
