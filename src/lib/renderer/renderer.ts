import type { VideoPlayer } from '$lib/video/video_player';
import { Precondition } from '$lib/precondition';
import { TintEffect } from './effects/tint';
import type { Effect } from './effect';
import type { RendererImageSource } from './image_source';
import { EdgeEffect } from './effects/edge';
import type { EffectsMap } from './effects.svelte';

export class Renderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly effectMap: Record<string, Effect<unknown>>;

  private constructor(readonly canvas: HTMLCanvasElement) {
    this.ctx = Precondition.checkExists(
      canvas.getContext('2d', {
        willReadFrequently: true,
      }),
    );

    this.effectMap = {
      edge: new EdgeEffect(),
      tint: new TintEffect(),
    };
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
      imageSource,
      effects,
      offset,
    }: {
      imageSource: RendererImageSource;
      effects?: EffectsMap;
      offset?: {
        offsetX: number | string | undefined;
        offsetY: number | string | undefined;
      };
    },
    next: { player: VideoPlayer } | undefined,
  ) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const box = this.getBox(imageSource, offset);

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
      imageSource.source(),
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

    if (effects) {
      this.applyEffects(effects);
    }
  }

  private async applyEffects(effects: EffectsMap) {
    for (const effectKey of Object.keys(this.effectMap)) {
      const effectConfig = effects[effectKey];
      if (effectConfig == null) {
        continue;
      }
      const effect = this.effectMap[effectKey];
      const effectContext = {
        ctx: this.ctx,
        width: this.width,
        height: this.height,
      };
      await effect.apply(effectContext, effectConfig);
    }
  }

  private applyVignette() {
    const { width, height } = this.canvas;
    const gradient = this.ctx.createRadialGradient(
      width / 2,
      height / 2,
      width / 4,
      width / 2,
      height / 2,
      width / 1.2,
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  private applyGrain(intensity: number = 0) {
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const rand = (Math.random() - 0.5) * intensity;
      data[i] += rand; // R
      data[i + 1] += rand; // G
      data[i + 2] += rand; // B
    }
    this.ctx.putImageData(imageData, 0, 0);
  }

  private applyHaze() {
    this.ctx.fillStyle = 'rgba(200, 200, 200, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private getBox(
    imageSource: RendererImageSource,
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
    const srcWidth = imageSource.width();
    const srcHeight = imageSource.height();

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
