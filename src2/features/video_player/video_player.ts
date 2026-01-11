import { defaults } from '../../lib/defaults';
import { Deferred } from '../../lib/deferred';
import { Subject } from '../../lib/subject';
import { VideoRenderSource } from '../renderer/render_source';
import type { VideoTimelineClip } from '../video_timeline/video_timeline_selectors';
import type { RenderablePlayer } from './renderable_player';

type VideoPlayerOptions = {
  rate?: number;
  trimmedDuration?: number;
};

const defaultOptions: VideoPlayerOptions = {
  rate: 1,
  trimmedDuration: undefined,
};

export class VideoPlayer implements RenderablePlayer {
  readonly element: HTMLVideoElement;
  readonly options: VideoPlayerOptions;
  readonly src: string | undefined;
  readonly srcObject: MediaProvider | null;
  readonly ended = new Subject<void>();
  readonly loaded: Promise<void>;
  private _isPlaying = false;
  private _isDestroyed = false;

  private constructor(
    element: HTMLVideoElement,
    argOptions: VideoPlayerOptions = {},
  ) {
    this.element = element;
    this.src = element.src;
    this.srcObject = element.srcObject;
    this.options = defaults(defaultOptions, argOptions);
    const loadedDeferred = new Deferred<void>();
    this.loaded = loadedDeferred.promise;
    element.addEventListener(
      'loadeddata',
      () => {
        loadedDeferred.resolve();
      },
      { once: true },
    );
    this.load();
  }

  static createFromElement(
    element: HTMLVideoElement,
    options: VideoPlayerOptions = {},
  ) {
    return new VideoPlayer(element, options);
  }

  static createFromPath(path: string, options: VideoPlayerOptions = {}) {
    const element = document.createElement('video');
    element.src = path;
    return this.createFromElement(element, options);
  }

  static createFromTimelineClip(timelineClip: VideoTimelineClip) {
    return this.createFromPath(timelineClip.clip.videoPath, {
      trimmedDuration: timelineClip.trimmedDuration,
      rate: timelineClip.rate,
    });
  }

  createRenderSource() {
    return new VideoRenderSource(this.element);
  }

  get isPlaying() {
    return this._isPlaying;
  }

  get isDestroyed() {
    return this._isDestroyed;
  }

  get width() {
    return this.element.videoWidth;
  }

  get height() {
    return this.element.videoHeight;
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

  private load() {
    if (this.src != null) {
      this.element.src = this.src;
    }
    if (this.srcObject != null) {
      this.element.srcObject = this.srcObject;
    }
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
