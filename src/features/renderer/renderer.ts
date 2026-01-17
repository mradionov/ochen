import { Precondition } from '../../lib/precondition';
import type { AudioInfo } from '../audio_processing/audio_analyser';
import { EffectsCompositor } from '../effects/effects_compositor';
import type { EffectsState } from '../effects/effects_store';
import type { RenderSource } from './render_source';

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly effectsCompositor: EffectsCompositor;

  private constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = Precondition.checkExists(
      canvas.getContext('2d', {
        willReadFrequently: true,
      }),
    );
    this.effectsCompositor = new EffectsCompositor();
  }

  // TODO: async
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
      audioInfo,
      offset,
      lastTime,
    }: {
      renderSource: RenderSource;
      effectsState?: EffectsState;
      audioInfo?: AudioInfo;
      lastTime: number;
      offset?: {
        offsetX: number | string | undefined;
        offsetY: number | string | undefined;
      };
    },
    // next: { player: VideoPlayer } | undefined,
  ) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const box = this.getBox(renderSource, offset);

    // const { timelineClip } = player;
    // const { effects, transitionOut } = player.timelineClip.clip;

    // if (effects?.blur != null) {
    //   this.ctx.filter = `blur(${effects.blur}px)`;
    // }

    // const unratedTransitionDuration = transitionOut.duration * timelineClip.rate;
    // const transitionStart =
    // 	timelineClip.sourceDuration - unratedTransitionDuration - (timelineClip.clip.trimEnd ?? 0);
    // const transitionElapsed = Math.max(0, player.element.currentTime - transitionStart);
    // const transitionProgress = transitionElapsed / unratedTransitionDuration;
    //
    // if (transitionOut.duration > 0) {
    // 	this.ctx.globalAlpha = 1 - transitionProgress;
    // }

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

    // if (transitionOut.duration > 0 && nextPlayer) {
    // 	this.ctx.globalAlpha = transitionProgress;
    //
    // 	const nextBox = this.getBox(nextPlayer);
    //
    // 	this.ctx.drawImage(
    // 		nextPlayer.element,
    // 		nextBox.srcX,
    // 		nextBox.srcY,
    // 		nextBox.srcWidth,
    // 		nextBox.srcHeight,
    // 		nextBox.dstX,
    // 		nextBox.dstY,
    // 		nextBox.dstWidth,
    // 		nextBox.dstHeight
    // 	);
    //
    // 	this.ctx.globalAlpha = 1;
    // }

    if (effectsState) {
      this.effectsCompositor.applyEffects(effectsState, {
        ctx: this.ctx,
        width: this.width,
        height: this.height,
        lastTime,
      });
    }
  }

  private getBox(
    renderSource: RenderSource,
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

    const sourceToCanvasRatio =
      srcHeight > srcWidth
        ? srcWidth / surfaceWidth
        : srcHeight / surfaceHeight;

    const dstWidth = srcWidth / sourceToCanvasRatio;
    const dstHeight = srcHeight / sourceToCanvasRatio;

    let dstX = 0;
    if (offsetX === 'left') {
      // noop
    } else if (offsetX === 'right') {
      dstX = -(dstWidth - surfaceWidth);
    } else if (offsetX === 'center') {
      dstX = -(dstWidth / 2 - surfaceWidth / 2);
    } else if (typeof offsetX === 'number') {
      dstX = offsetX;
    }

    let dstY = 0;
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
