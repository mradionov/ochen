import {defaults} from "./util.js";
import {createRenderer} from "./renderer.js";

const DEFAULT_OPTIONS = {
  width: 800,
  height: 800,
  /** 'left' | 'center' | 'right' | number */
  offsetX: 'center',
  /** 'top' | 'center' | 'bottom' | number */
  offsetY: 'center',
  rate: 1,
  /** true | false */
  loop: false,
  /**
   * {
   *  duration: number,
   *  kind: 'cut' | 'fade'
   * }
   */
  transitionOut: undefined,
  tint: undefined,
  onTransitionOutStart: undefined,
  onEnded: undefined,
};

export function createPlayer(path, argOptions = {}) {
  const options = defaults(DEFAULT_OPTIONS, argOptions);

  const renderer = createRenderer({
    width: options.width,
    height: options.height,
    tint: options.tint,
  });

  const {$canvas} = renderer;

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
    const {duration, kind} = options.transitionOut;
    const startSec = $video.duration - duration;
    if ($video.currentTime > startSec && !hasTransitionOurStarted) {
      hasTransitionOurStarted = true;
      options?.onTransitionOutStart();
      switch (kind) {
        case 'fade':
          $canvas.classList.add('transition-out-fade');
          $canvas.style.animationDuration = `${duration / options.rate}s`;
          break;
        case 'cut':
        default:
          $canvas.classList.add('transition-out-cut');
      }
    } else if ($video.currentTime < startSec && hasTransitionOurStarted) {
      hasTransitionOurStarted = false;
    }
  };
  const onVideoEnded = () => {
    options.onEnded?.();
  };
  loadVideo();

  function drawFrame() {
    renderer.updateFrame($video);
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
