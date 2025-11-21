import { defaults } from '$lib/defaults';
import { Subject } from '$lib/subject';
import type { AudioTimelineClip } from './audio_timeline.svelte';

type AudioPlayerOptions = {
  trimmedDuration?: number;
};

const defaultOptions: AudioPlayerOptions = {
  trimmedDuration: undefined,
};

export class AudioPlayer {
  readonly options: AudioPlayerOptions;
  readonly ended = new Subject<void>();
  private _isPlaying = false;

  private constructor(
    readonly element: HTMLAudioElement,
    argOptions: AudioPlayerOptions = {},
  ) {
    this.options = defaults(defaultOptions, argOptions);
    this.load();
  }

  static createFromElement(
    element: HTMLAudioElement,
    options: AudioPlayerOptions = {},
  ) {
    return new AudioPlayer(element, options);
  }

  static createFromPath(path: string, options: AudioPlayerOptions = {}) {
    const element = document.createElement('video');
    element.src = path;
    return this.createFromElement(element, options);
  }

  static createFromTimelineClip(timelineClip: AudioTimelineClip) {
    return this.createFromPath(timelineClip.clip.audioPath, {
      trimmedDuration: timelineClip.trimmedDuration,
    });
  }

  get isPlaying() {
    return this._isPlaying;
  }

  async play() {
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

  seek(time: number) {
    this.element.currentTime = time;
  }

  destroy() {
    this.element.removeAttribute('src'); // empty source
    this.element.load();
    this.element.removeEventListener('timeupdate', this.onElementTimeUpdate);
    this.element.removeEventListener('ended', this.onElementEnded);
    this.ended.removeAllListeners();
  }

  private load() {
    this.element.currentTime = 0.01;
    this.element.addEventListener('timeupdate', this.onElementTimeUpdate);
    this.element.addEventListener('ended', this.onElementEnded);
  }

  private onElementTimeUpdate = () => {
    if (!this.isPlaying) return;

    const duration = this.options.trimmedDuration ?? this.element.duration;
    if (this.element.currentTime > duration) {
      this._isPlaying = false;
      this.ended.emit();
      this.destroy();
    }
  };

  private onElementEnded = () => {
    this.ended.emit();
  };
}
