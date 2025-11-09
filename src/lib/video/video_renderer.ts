import type { VideoPlayer } from '$lib/video/video_player';
import { hexToRgb } from '$lib/color';
import type { VideoEffects } from '$lib/manifest/manifest.svelte';
import { Precondition } from '$lib/precondition';

type RendererImageSource = (
  | {
      source(): HTMLVideoElement;
    }
  | {
      source(): ImageBitmap;
    }
) & {
  width(): number;
  height(): number;
};

export class ImageBitmapSource {
  constructor(private readonly imageBitmap: ImageBitmap) {}

  source() {
    return this.imageBitmap;
  }

  width() {
    return this.imageBitmap.width;
  }

  height() {
    return this.imageBitmap.height;
  }
}

export class VideoImageSource {
  constructor(private readonly video: HTMLVideoElement) {}

  source() {
    return this.video;
  }

  width() {
    return this.video.videoWidth;
  }

  height() {
    return this.video.videoHeight;
  }
}

export class VideoRenderer {
  private readonly ctx: CanvasRenderingContext2D;

  private constructor(readonly canvas: HTMLCanvasElement) {
    this.ctx = Precondition.checkExists(
      canvas.getContext('2d', {
        willReadFrequently: true,
      }),
    );
  }

  // TODO: async
  static createFromSize({ width, height }: { width: number; height: number }) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return new VideoRenderer(canvas);
  }

  static createFromCanvas(canvas: HTMLCanvasElement) {
    return new VideoRenderer(canvas);
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
      effects?: VideoEffects;
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

    if (effects?.blur != null) {
      this.ctx.filter = `blur(${effects.blur}px)`;
    }

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

    if (effects?.tint) {
      this.applyTint(effects.tint);
    }

    if (effects?.vignette) {
      this.applyVignette();
    }

    if (effects?.grain != null) {
      this.applyGrain(effects.grain);
    }

    // if (effects.haze) {
    //   applyHaze(ctx);
    // }
  }

  private applyTint(tint: string) {
    const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
    const tintRGB = hexToRgb(tint);

    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const gray = r * 0.299 + g * 0.587 + b * 0.114;

      data[i] = tintRGB.r * (gray / 255);
      data[i + 1] = (tintRGB.g * gray) / 255;
      data[i + 2] = (tintRGB.b * gray) / 255;
    }

    this.ctx.putImageData(imageData, 0, 0);
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

  private applyEdges(
    imageData: ImageData,
    options: {
      kernel?: 'prewitt' | 'laplacian' | 'sobel';
      threshold?: number;
    } = {},
  ) {
    const { width, height, data } = imageData;

    const srcData = data;

    const gray = new Uint8ClampedArray(width * height);
    for (let i = 0; i < width * height; i++) {
      const r = srcData[i * 4];
      const g = srcData[i * 4 + 1];
      const b = srcData[i * 4 + 2];
      gray[i] = 0.3 * r + 0.59 * g + 0.11 * b;
    }

    let gx, gy;
    switch (options.kernel) {
      case 'prewitt':
        gx = [-1, 0, 1, -1, 0, 1, -1, 0, 1];
        gy = [-1, -1, -1, 0, 0, 0, 1, 1, 1];
        break;
      case 'laplacian':
        gx = [0, 1, 0, 1, -4, 1, 0, 1, 0];
        gy = [0, 1, 0, 1, -4, 1, 0, 1, 0];
        break;
      case 'sobel':
      default:
        gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    }

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let px = 0,
          py = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const val = gray[(y + ky) * width + (x + kx)];
            const k = (ky + 1) * 3 + (kx + 1);
            px += gx[k] * val;
            py += gy[k] * val;
          }
        }
        let mag = Math.sqrt(px * px + py * py);
        if (options.threshold != null) {
          mag = mag > options.threshold ? mag : 0;
        }
        const i = (y * width + x) * 4;
        data[i] = data[i + 1] = data[i + 2] = mag;
        data[i + 3] = 255;
      }
    }
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

    const surfaceWidth = this.canvas.width;
    const surfaceHeight = this.canvas.height;

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
