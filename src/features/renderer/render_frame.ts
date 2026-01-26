import type { RenderSource } from './render_source';

export type RenderFrame = {
  renderSource: RenderSource;
  offset?: {
    offsetX: number | string | undefined;
    offsetY: number | string | undefined;
  };
};
