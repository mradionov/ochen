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

export class ImageBitmapRenderSource {
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
  constructor(private readonly image: HTMLImageElement) {}

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
