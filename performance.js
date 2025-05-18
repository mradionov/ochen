import {fetchManifest} from "./manifest.js";
import {createRenderer} from "./renderer.js";

const $page = document.querySelector('#performance-page');
const $content = document.querySelector('#performance-content');
const $fullscreen = document.querySelector('#performance-fullscreen');

export async function openPerformance() {
  $page.style.display = 'block';

  const manifest = await fetchManifest();

  let currentIndex = 0;
  let currentRenderer;
  let nextRenderer;

  const getCurrentSceneIndex = () => currentIndex;
  const getNextSceneIndex = () => currentIndex + 1;
  const getCurrentScene = () => manifest.scenes[getCurrentSceneIndex()];
  const getNextScene = () => manifest.scenes[getNextSceneIndex()];
  const isLastScene = (index) => index >= manifest.scenes.length - 1;

  const createRendererForScene = (scene, sceneIndex) => {
    const isLast = isLastScene(sceneIndex);
    return createRenderer(scene.videoPath, {
      width: 1080,
      height: 1080,
      tint: manifest.tint,
      transitionOut: !isLast ? manifest.transitionOut : undefined,
      offsetX: scene.offsetX,
      offsetY: scene.offsetY,
      loop: isLast,
      rate: 10,
      onTransitionOutStart: () => {
        void nextRenderer?.play();
      },
      onEnded: () => {
        incrementScene();
      },
    });
  };

  const resetRenderers = () => {
    let oldRenderer = currentRenderer;

    if (nextRenderer) {
      currentRenderer = nextRenderer;
    } else {
      const currentScene = getCurrentScene();
      if (currentScene) {
        currentRenderer = createRendererForScene(getCurrentScene(), getCurrentSceneIndex())
        $content.appendChild(currentRenderer.$canvas);
      } else {
        currentRenderer = undefined;
      }
    }

    const nextScene = getNextScene();
    if (nextScene) {
      nextRenderer = createRendererForScene(nextScene, getNextSceneIndex());
      $content.appendChild(nextRenderer.$canvas);
      void nextRenderer.showPoster();
    } else {
      nextRenderer = undefined;
    }

    if (oldRenderer && !isLastScene(getCurrentSceneIndex())) {
      oldRenderer.destroy();
      $content.removeChild(oldRenderer.$canvas);
    }

    void currentRenderer?.play();
  };

  const incrementScene = () => {
    currentIndex += 1;
    resetRenderers();
  };

  resetRenderers();
}

$fullscreen.addEventListener('click', async () => {
  // await $content.requestFullscreen();
});
