import {fetchManifest} from "./manifest.js";
import {SceneManager} from "./scene_manager.js";
import {Loop} from "./loop.js";

const $page = document.querySelector('#performance-page');
const $content = document.querySelector('#performance-content');
const $fullscreen = document.querySelector('#performance-fullscreen');

export async function openPerformance(setId) {
  $page.style.display = 'block';

  const manifest = await fetchManifest(setId);

  const sceneManager = new SceneManager(manifest, $content);
  sceneManager.resetPlayers();

  const onTick = ({deltaTime}) => {
    sceneManager.update({deltaTime});
  };

  const loop = new Loop(onTick);
  loop.start();
}

$fullscreen.addEventListener('click', async () => {
  await $content.requestFullscreen();
});
