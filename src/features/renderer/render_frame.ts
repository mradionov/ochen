import type { RenderSource } from './render_source';

export type RenderFrame = {
  renderSource: RenderSource;
  fit?: 'contain' | 'cover';
  offset?: {
    offsetX: number | string | undefined;
    offsetY: number | string | undefined;
  };
};
