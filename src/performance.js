import { fetchManifest } from './manifest.ts';
import { SceneManager } from './scene_manager.ts';
import { Render_loop } from './render_loop.ts';

const $page = document.querySelector('#performance-page');
const $content = document.querySelector('#performance-content');
const $fullscreen = document.querySelector('#performance-fullscreen');

export async function openPerformance(setId) {
  $page.style.display = 'block';

  const manifest = await fetchManifest(setId);

  const sceneManager = new SceneManager(manifest, $content);
  sceneManager.resetPlayers();

  const onTick = ({ deltaTime }) => {
    sceneManager.update({ deltaTime });
  };

  const loop = new Render_loop(onTick);
  loop.start();
}

$fullscreen.addEventListener('click', async () => {
  await $content.requestFullscreen();
});
