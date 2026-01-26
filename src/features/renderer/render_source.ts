export type RenderSource = (
  | {
      source(): HTMLVideoElement;
    }
  | {
      source(): HTMLImageElement;
    }
  | {
      source(): ImageBitmap;
    }
) & {
  width(): number;
  height(): number;
};

function createEmptyImageBitmap(
  width: number,
  height: number,
  fill: 'transparent' | string = 'transparent',
): ImageBitmap {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;

  if (fill !== 'transparent') {
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  return canvas.transferToImageBitmap();
}

export class ImageBitmapRenderSource {
  private readonly imageBitmap: ImageBitmap;

  constructor(imageBitmap: ImageBitmap) {
    this.imageBitmap = imageBitmap;
  }

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

export class AsyncImageBitmapRenderSource {
  private imageBitmap: ImageBitmap = createEmptyImageBitmap(1, 1);

  constructor(imageBitmapPromise: Promise<ImageBitmap>) {
    imageBitmapPromise
      .then((imageBitmap) => {
        this.imageBitmap = imageBitmap;
      })
      .catch((error) => {
        console.error('Failed to create ImageBitmap:', error);
      });
  }

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

export class PlaceholderRenderSource {
  static cachedImage: HTMLImageElement;

  private image: HTMLImageElement;

  constructor({
    width = 1,
    height = 1,
    color = '#ff0000',
  }: { width?: number; height?: number; color?: string } = {}) {
    if (PlaceholderRenderSource.cachedImage) {
      this.image = PlaceholderRenderSource.cachedImage;
    } else {
      const normalizedWidth = Math.max(1, Math.floor(width));
      const normalizedHeight = Math.max(1, Math.floor(height));
      this.image = new Image(normalizedWidth, normalizedHeight);
      this.image.src = this.createSolidSvgDataUrl(
        normalizedWidth,
        normalizedHeight,
        color,
      );
      PlaceholderRenderSource.cachedImage = this.image;
    }
  }

  private createSolidSvgDataUrl(width: number, height: number, color: string) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${color}"/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  source() {
    return this.image;
  }

  width() {
    return this.image.width;
  }

  height() {
    return this.image.height;
  }
}

export class ImageRenderSource {
  private readonly image: HTMLImageElement;

  constructor(image: HTMLImageElement) {
    this.image = image;
  }

  source() {
    return this.image;
  }

  width() {
    return this.image.width;
  }

  height() {
    return this.image.height;
  }
}

export class VideoRenderSource {
  private readonly video: HTMLVideoElement;

  constructor(video: HTMLVideoElement) {
    this.video = video;
  }

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
