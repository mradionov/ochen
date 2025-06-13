import {fetchManifest} from "./manifest.js";
import {createPlayer} from "./player.js";

const $page = document.querySelector('#performance-page');
const $content = document.querySelector('#performance-content');
const $fullscreen = document.querySelector('#performance-fullscreen');

export async function openPerformance() {
  $page.style.display = 'block';

  const manifest = await fetchManifest();

  let currentIndex = 0;
  let currentPlayer;
  let nextPlayer;

  const getCurrentSceneIndex = () => currentIndex;
  const getNextSceneIndex = () => currentIndex + 1;
  const getCurrentScene = () => manifest.scenes[getCurrentSceneIndex()];
  const getNextScene = () => manifest.scenes[getNextSceneIndex()];
  const isLastScene = (index) => index >= manifest.scenes.length - 1;

  const createPlayerForScene = (scene, sceneIndex) => {
    const isLast = isLastScene(sceneIndex);
    return createPlayer(scene.videoPath, {
      // width: 1080,
      // height: 1080,
      width: 400,
      height: 400,
      tint: manifest.tint,
      transitionOut: !isLast ? manifest.transitionOut : undefined,
      offsetX: scene.offsetX,
      offsetY: scene.offsetY,
      loop: isLast,
      // rate: 1,
      onTransitionOutStart: () => {
        void nextPlayer?.play();
      },
      onEnded: () => {
        incrementScene();
      },
    });
  };

  const resetPlayers = (autoplay = false) => {
    let oldPlayer = currentPlayer;

    if (nextPlayer) {
      currentPlayer = nextPlayer;
    } else {
      const currentScene = getCurrentScene();
      if (currentScene) {
        currentPlayer = createPlayerForScene(getCurrentScene(), getCurrentSceneIndex())
        $content.appendChild(currentPlayer.$canvas);
      } else {
        currentPlayer = undefined;
      }
    }

    const nextScene = getNextScene();
    if (nextScene) {
      nextPlayer = createPlayerForScene(nextScene, getNextSceneIndex());
      $content.appendChild(nextPlayer.$canvas);
      void nextPlayer.showPoster();
    } else {
      nextPlayer = undefined;
    }

    if (oldPlayer && !isLastScene(getCurrentSceneIndex())) {
      oldPlayer.destroy();
      $content.removeChild(oldPlayer.$canvas);
    }

    void currentPlayer?.play();
  };

  const incrementScene = () => {
    currentIndex += 1;
    resetPlayers();
  };

  resetPlayers();
}

$fullscreen.addEventListener('click', async () => {
  await $content.requestFullscreen();
});
