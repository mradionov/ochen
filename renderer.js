import {hexToRgb} from "./color.js";

const DEFAULT_OPTIONS = {
  width: 800,
  height: 800,
  /**
   * 'left' | 'center' | 'right' | number
   */
  offsetX: 'center',
  /**
   * 'top' | 'center' | 'bottom' | number
   */
  offsetY: 'center',
  rate: 1,
  /**
   * true | false
   */
  loop: false,
  /**
   * {
   *  duration: number,
   * }
   */
  transitionOut: undefined,
  tint: undefined,
  onTransitionOutStart: undefined,
  onEnded: undefined,
};

export function createRenderer(path, argOptions = {}) {
  const options = defaults(DEFAULT_OPTIONS, argOptions);

  const $canvas = document.createElement('canvas');
  $canvas.width = options.width ?? 800;
  $canvas.height = options.height ?? 800;

  const ctx = $canvas.getContext('2d', {
    willReadFrequently: true,
  });

  let hasTransitionOurStarted = false;
  const $video = document.createElement('video');
  const loadVideo = () => {
    $video.muted = true;
    $video.src = path;
    $video.playbackRate = options.rate;
    $video.loop = options.loop;
    $video.addEventListener('timeupdate', onVideoTime);
    $video.addEventListener('ended', onVideoEnded);
  };
  const destroyVideo = () => {
    $video.removeAttribute('src'); // empty source
    $video.load();
    $video.removeEventListener('timeupdate', onVideoTime);
    $video.removeEventListener('ended', onVideoEnded);
    hasTransitionOurStarted = false;
  };
  const onVideoTime = () => {
    if (!options.transitionOut) {
      return;
    }
    const {duration} = options.transitionOut;
    const startSec = $video.duration - duration;
    if ($video.currentTime > startSec && !hasTransitionOurStarted) {
      hasTransitionOurStarted = true;
      options?.onTransitionOutStart();
      $canvas.style.display = 'none';
    } else if ($video.currentTime < startSec && hasTransitionOurStarted) {
      hasTransitionOurStarted = false;
    }
  };
  const onVideoEnded = () => {
    options?.onEnded();
  };
  loadVideo();

  function drawFrame() {
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

    ctx.drawImage($video, 0, 0, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);

    const {tint} = options;
    if (tint) {
      const tintRGB = hexToRgb(tint);
      const imageData = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
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
      ctx.putImageData(imageData, 0, 0);
    }
  }

  let isPlaying = false;
  let isDestroyed = false;

  async function ensureFrame() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        drawFrame();
        resolve();
      });
    })
  }

  function loopFrames() {
    if (isPlaying && !isDestroyed) {
      requestAnimationFrame(() => {
        loopFrames();
      });
    }

    drawFrame();
  }

  const play = async () => {
    if (isDestroyed) {
      loadVideo();
      isDestroyed = false;
    }
    await $video.play();
    isPlaying = true;
    loopFrames();
  };

  const pause = async () => {
    await $video.pause();
    isPlaying = false;

    await ensureFrame();
    destroy();
  };

  const togglePlay = async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  };

  const showPoster = async () => {
    await $video.play();
    await $video.pause();
    drawFrame();
  };

  const destroy = () => {
    isDestroyed = true;
    destroyVideo();
  };

  const changeTint = async (newTint) => {
    options.tint = newTint;
    loadVideo();
    await showPoster();
    destroy();
  };

  return {
    $canvas,
    play,
    pause,
    togglePlay,
    showPoster,
    changeTint,
    getDuration: () => $video.duration,
    destroy,
  };
}

function defaults(def, actual) {
  const final = {...def};

  Object.keys(actual).forEach((key) => {
    const value = actual[key];
    if (value != null) {
      final[key] = value;
    }
  });

  return final;
}
