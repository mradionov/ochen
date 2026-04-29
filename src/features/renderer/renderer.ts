import { Precondition } from '../../lib/precondition';
import { EffectsCompositor } from '../effects/effects_compositor';
import type { EffectsState } from '../effects/effects_store';
import type { RenderSource } from './render_source';

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly effectsCompositor: EffectsCompositor;

  private isRendering = false;

  private constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = Precondition.checkExists(
      canvas.getContext('2d', {
        willReadFrequently: true,
      }),
    );
    this.effectsCompositor = new EffectsCompositor();
  }

  static createFromSize({ width, height }: { width: number; height: number }) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return new Renderer(canvas);
  }

  static createFromCanvas(canvas: HTMLCanvasElement) {
    return new Renderer(canvas);
  }

  private get width() {
    return this.canvas.width;
  }

  private get height() {
    return this.canvas.height;
  }

  updateFrame(
    {
      renderSource,
      effectsState,
      fit = 'contain',
      offset,
      lastTime,
    }:  {
      renderSource: RenderSource;
      effectsState?: EffectsState;
      fit?: 'contain' | 'cover';
      lastTime: number;
      offset?: {
        offsetX: number | string | undefined;
        offsetY: number | string | undefined;
      };
    },
  ) {
    if (this.isRendering) return;
    this.isRendering = true;
    try {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const box = this.getBox(renderSource, fit, offset);

    this.ctx.drawImage(
      renderSource.source(),
      box.srcX,
      box.srcY,
      box.srcWidth,
      box.srcHeight,
      box.dstX,
      box.dstY,
      box.dstWidth,
      box.dstHeight,
    );

    if (effectsState) {
      this.effectsCompositor.applyEffects(effectsState, {
        ctx: this.ctx,
        width: this.width,
        height: this.height,
        lastTime,
      });
    }
    } finally {
      this.isRendering = false;
    }
  }

  private getBox(
    renderSource: RenderSource,
    fit: 'contain' | 'cover' = 'contain',
    offset: {
      offsetX: number | string | undefined;
      offsetY: number | string | undefined;
    } = {
      offsetX: undefined,
      offsetY: undefined,
    },
  ): {
    srcX: number;
    srcY: number;
    srcWidth: number;
    srcHeight: number;
    dstX: number;
    dstY: number;
    dstWidth: number;
    dstHeight: number;
  } {
    const { offsetX, offsetY } = offset;

    const srcX = 0;
    const srcY = 0;
    const srcWidth = renderSource.width();
    const srcHeight = renderSource.height();

    const surfaceWidth = this.width;
    const surfaceHeight = this.height;

    const scaleX = surfaceWidth / srcWidth;
    const scaleY = surfaceHeight / srcHeight;
    const scale = fit === 'cover'
      ? Math.max(scaleX, scaleY)
      : Math.min(scaleX, scaleY);

    const dstWidth = srcWidth * scale;
    const dstHeight = srcHeight * scale;

    // cover: center by default so cropping is symmetric
    let dstX = fit === 'cover' ? (surfaceWidth - dstWidth) / 2 : 0;
    if (offsetX === 'left') {
      // noop
    } else if (offsetX === 'right') {
      dstX = -(dstWidth - surfaceWidth);
    } else if (offsetX === 'center') {
      dstX = -(dstWidth / 2 - surfaceWidth / 2);
    } else if (typeof offsetX === 'number') {
      dstX = offsetX;
    }

    let dstY = fit === 'cover' ? (surfaceHeight - dstHeight) / 2 : 0;
    if (offsetY === 'top') {
      // noop
    } else if (offsetY === 'bottom') {
      dstY = -(dstHeight - surfaceHeight);
    } else if (offsetY === 'center') {
      dstY = -(dstHeight / 2 - surfaceHeight / 2);
    } else if (typeof offsetY === 'number') {
      dstY = offsetY;
    }

    return { srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight };
  }
}
