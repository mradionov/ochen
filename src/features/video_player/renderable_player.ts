import type { Subject } from '../../lib/subject';
import type { RenderSource } from '../renderer/render_source';

export interface RenderablePlayer {
  ended: Subject<void>;
  width: number;
  height: number;
  isPlaying: boolean;
  isDestroyed: boolean;
  play(): void | Promise<void>;
  pause(): void;
  togglePlay(): void | Promise<void>;
  seek(time: number): void;
  updateFrame(): void;
  destroy(): void;
  createRenderSource: () => RenderSource;
  loaded: Promise<void>;
  element: HTMLVideoElement | HTMLImageElement;
}
