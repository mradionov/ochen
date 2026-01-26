import { Deferred } from '../../lib/deferred';
import { RunningClock } from '../../lib/running_clock';
import { Subject } from '../../lib/subject';
import {
  AsyncImageBitmapRenderSource,
  PlaceholderRenderSource,
  type RenderSource,
} from '../renderer/render_source';
import type { RenderablePlayer } from './renderable_player';

export class ImagePlayer implements RenderablePlayer {
  readonly element: HTMLImageElement;
  readonly duration: number;
  readonly ended = new Subject<void>();
  readonly loaded: Promise<void>;
  private clock = new RunningClock();
  private _isLoaded = false;
  private _isPlaying = false;
  private _isDestroyed = false;
  private renderSource: RenderSource = new PlaceholderRenderSource();

  private constructor(element: HTMLImageElement, duration: number) {
    this.element = element;
    this.duration = duration;

    const loadedDeferred = new Deferred<void>();
    this.loaded = loadedDeferred.promise;

    element.addEventListener(
      'load',
      () => {
        loadedDeferred.resolve(undefined);
        const imageBitmapPromise = createImageBitmap(this.element);
        this.renderSource = new AsyncImageBitmapRenderSource(
          imageBitmapPromise,
        );
      },
      { once: true },
    );
  }

  static createFromElement(element: HTMLImageElement, duration: number) {
    return new ImagePlayer(element, duration);
  }

  static createFromPath(path: string, durarion: number) {
    const element = new Image();
    element.src = path;
    return this.createFromElement(element, durarion);
  }

  createRenderSource() {
    return this.renderSource;
  }

  get isPlaying() {
    return this._isPlaying;
  }

  get isDestroyed() {
    return this._isDestroyed;
  }

  get width() {
    return this.element.width;
  }

  get height() {
    return this.element.height;
  }

  async play() {
    if (this._isPlaying) {
      return;
    }
    this._isPlaying = true;
    this.clock.play();
  }

  pause() {
    if (!this._isPlaying) {
      return;
    }
    this._isPlaying = false;
    this.clock.pause();
  }

  seek(time: number) {
    this.clock.seek(time);
  }

  async togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      await this.play();
    }
  }

  updateFrame() {
    if (!this.isPlaying) return;

    if (this.clock.currentTime > this.duration) {
      this._isPlaying = false;
      this.ended.emit();
      this.destroy();
    }
  }

  destroy() {
    this._isDestroyed = true;
    this._isPlaying = false;
    this.ended.removeAllListeners();
  }
}
