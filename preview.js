import {fetchManifest} from "./manifest.js";
import {createRenderer} from "./renderer.js";

const $page = document.querySelector('#preview-page');
const $content = document.querySelector('#preview-content');
const $totalDuration = document.querySelector('#preview-total-duration');
const $colorPicker = document.querySelector('#preview-color-picker');

export async function openPreview() {
  $page.style.display = 'block';

  const manifest = await fetchManifest();

  let totalDuration = 0;

  const renderers = [];

  for (const scene of manifest.scenes) {
    const renderer = createRenderer(scene.videoPath, {
      width: 200,
      height: 200,
      rate: 10,
      tint: manifest.tint,
      offsetX: scene.offsetX,
      offsetY: scene.offsetY,
    });

    const {$canvas} = renderer;

    $content.appendChild($canvas);

    $canvas.style = 'margin: 5px';

    $canvas.addEventListener('click', () => {
      renderer.togglePlay();
    });

    await renderer.showPoster();

    totalDuration += renderer.getDuration();

    renderer.destroy();

    renderers.push(renderer);
  }

  const totalDurationMin = Math.floor(totalDuration / 60);
  const totalDurationSecRest = Math.floor(totalDuration % 60);

  $totalDuration.innerHTML = `${totalDurationMin}m ${totalDurationSecRest}s`;

  $colorPicker.value = manifest.tint;
  $colorPicker.addEventListener('change', async () => {
    for (const renderer of renderers) {
      await renderer.changeTint($colorPicker.value);
    }
    console.log('New tint: %s', $colorPicker.value);
  });
}
