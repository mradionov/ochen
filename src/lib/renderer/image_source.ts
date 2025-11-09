export type RendererImageSource = (
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
