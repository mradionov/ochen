import {hexToRgb} from "./color.js";
import {defaults} from "./util.js";

const DEFAULT_CREATE_OPTIONS = {
  width: 800,
  height: 800,
  /** 'left' | 'center' | 'right' | number */
  offsetX: 'center',
  /** 'top' | 'center' | 'bottom' | number */
  offsetY: 'center',
  tint: undefined,
};

export function createRenderer(argOptions = {}) {
  const options = defaults(DEFAULT_CREATE_OPTIONS, argOptions);

  const $canvas = document.createElement('canvas');
  $canvas.width = options.width;
  $canvas.height = options.height;

  const ctx = $canvas.getContext('2d', {
    willReadFrequently: true,
  });

  const updateFrame = ($video) => {
    const {srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight} = getBox($video, $canvas, options);

    ctx.drawImage($video, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);

    const imageData = ctx.getImageData(0, 0, $canvas.width, $canvas.height);

    if (options.tint) {
      applyTint(ctx, imageData, options.tint);
    }

    ctx.putImageData(imageData, 0, 0);
  };

  return {
    $canvas,
    updateFrame,
  };
}

function applyTint(ctx, imageData, tint) {
  const tintRGB = hexToRgb(tint);

  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const gray = r * 0.299 + g * 0.587 + b * 0.114;

    data[i] = tintRGB.r * (gray / 255);
    data[i + 1] = tintRGB.g * gray / 255;
    data[i + 2] = tintRGB.b * gray / 255;
  }
}

function getBox($video, $canvas, argOptions = {}) {
  const options = defaults(argOptions, {
    offsetX: undefined,
    offsetY: undefined,
  });

  const srcX = 0;
  const srcY = 0;
  const srcWidth = $video.videoWidth;
  const srcHeight = $video.videoHeight;

  const sourceToCanvasRatio = srcHeight > srcWidth
    ? srcWidth / $canvas.width
    : srcHeight / $canvas.height;

  const dstWidth = srcWidth / sourceToCanvasRatio;
  const dstHeight = srcHeight / sourceToCanvasRatio;

  let dstX = 0;
  if (options.offsetX === 'left') {
    // noop
  } else if (options.offsetX === 'right') {
    dstX = -(dstWidth - $canvas.width);
  } else if (options.offsetX === 'center') {
    dstX = -(dstWidth / 2 - $canvas.width / 2);
  } else if (typeof options.offsetX === 'number') {
    dstX = options.offsetX;
  }

  let dstY = 0;
  if (options.offsetY === 'top') {
    // noop
  } else if (options.offsetY === 'bottom') {
    dstY = -(dstHeight - $canvas.height);
  } else if (options.offsetY === 'center') {
    dstY = -(dstHeight / 2 - $canvas.height / 2);
  } else if (typeof options.offsetY === 'number') {
    dstY = options.offsetY;
  }

  return {srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight}
}
