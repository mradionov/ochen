// import type { VideoPlayer } from '$lib/video/video_player';
// import { TintEffect } from '../../../src/lib/renderer/effects/tint';
// import type { Effect } from '../../../src/lib/renderer/effect';
// // import type { RenderSource } from '../../../src/lib/renderer/render_source';
// import { EdgeEffect } from '../../../src/lib/renderer/effects/edge';
// import type { EffectsMap } from '../../../src/lib/renderer/effects_map.svelte';
// import { GrainEffect } from '../../../src/lib/renderer/effects/grain';
// // import type { AudioInfo } from '$lib/audio/audio_analyser';
// import { GlitchEffect } from '../../../src/lib/renderer/effects/glitch';

import { Precondition } from '../../lib/precondition';
import type { VideoPlayer } from '../video/video_player';
import type { RenderSource } from './render_source';
import type { EffectsStore } from './stores/effects_store';

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  // private readonly effectMap: Record<string, Effect<unknown>>;

  private constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = Precondition.checkExists(
      canvas.getContext('2d', {
        willReadFrequently: true,
      }),
    );

    // this.effectMap = {
    // grain: new GrainEffect(),
    // edge: new EdgeEffect(),
    // tint: new TintEffect(),
    // glitch: new GlitchEffect(),
    // };
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
      effectsStore,
      // audioInfo,
      offset,
      lastTime,
    }: {
      renderSource: RenderSource;
      effectsStore?: EffectsStore;
      // audioInfo?: AudioInfo;
      lastTime?: number;
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

    // if (effects) {
    //   this.applyEffects(effects, lastTime, audioInfo);
    // }
  }

  // private async applyEffects(
  //   effectsStore: EffectsStore,
  //   lastTime: number,
  //   // audioInfo: AudioInfo | undefined,
  // ) {
  //   const defaultOrder = effects.order ?? ['tint', 'edge', 'glitch', 'grain'];

  //   for (const effectKey of defaultOrder) {
  //     const effectConfig = effects[effectKey];
  //     if (effectConfig == null) {
  //       continue;
  //     }
  //     // const effect = this.effectMap[effectKey];
  //     // if (!effect) {
  //     //   continue;
  //     // }
  //     // const effectContext = {
  //     //   ctx: this.ctx,
  //     //   width: this.width,
  //     //   height: this.height,
  //     //   lastTime,
  //     // };
  //     // await effect.apply(effectContext, effectConfig, audioInfo);
  //   }
  // }

  // private applyVignette() {
  //   const { width, height } = this.canvas;
  //   const gradient = this.ctx.createRadialGradient(
  //     width / 2,
  //     height / 2,
  //     width / 4,
  //     width / 2,
  //     height / 2,
  //     width / 1.2,
  //   );
  //   gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  //   gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
  //   this.ctx.fillStyle = gradient;
  //   this.ctx.fillRect(0, 0, width, height);
  // }

  // private applyGrain(intensity: number = 0) {
  //   const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
  //   const data = imageData.data;
  //   for (let i = 0; i < data.length; i += 4) {
  //     const rand = (Math.random() - 0.5) * intensity;
  //     data[i] += rand; // R
  //     data[i + 1] += rand; // G
  //     data[i + 2] += rand; // B
  //   }
  //   this.ctx.putImageData(imageData, 0, 0);
  // }

  // private applyHaze() {
  //   this.ctx.fillStyle = 'rgba(200, 200, 200, 0.1)';
  //   this.ctx.fillRect(0, 0, this.width, this.height);
  // }

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
