import {fetchManifest} from "./manifest.js";
import {Player} from "./player.js";
import {createRenderer} from "./renderer.js";
import {Loop} from "./loop.js";

const $page = document.querySelector('#preview-page');
const $content = document.querySelector('#preview-content');
const $totalDuration = document.querySelector('#preview-total-duration');
const $colorPicker = document.querySelector('#preview-color-picker');

export async function openPreview(setId) {
  $page.style.display = 'block';

  const manifest = await fetchManifest(setId);

  let totalDuration = 0;
  const players = [];

  for (const scene of manifest.scenes) {
    const renderer = createRenderer({
      width: 200,
      height: 200,
      effects: manifest.effects,
      offsetX: scene.offsetX,
      offsetY: scene.offsetY,
    });


    const previewRate = 10;

    const player = new Player(scene.videoPath, renderer, {
      width: 200,
      height: 200,
      rate: previewRate,
    });

    const {$canvas} = renderer;

    $canvas.addEventListener('click', () => {
      player.togglePlay();
    });

    await player.showPoster();

    const rate = scene.rate ?? 1;
    const duration = player.getDuration() / rate;

    const $item = createItem($canvas, scene.videoId, duration, totalDuration, rate);
    $content.appendChild($item);

    totalDuration += duration;

    player.destroy();

    players.push(player);
  }

  $totalDuration.innerHTML = toMinutesString(totalDuration);

  $colorPicker.value = manifest.tint;
  $colorPicker.addEventListener('change', async () => {
    for (const player of players) {
      await player.changeTintColor($colorPicker.value);
    }
    console.log('New tint: %s', $colorPicker.value);
  });

  const onTick = ({deltaTime}) => {
    for (const player of players) {
      player.update({deltaTime});
    }
  };

  const loop = new Loop(onTick);
  loop.start();
}

function createItem($canvas, title, duration, start, rate) {
  const $item = document.createElement('div');
  $item.classList.add('preview-item');

  $item.appendChild($canvas);

  const $descTop = document.createElement('div');
  $descTop.classList.add('preview-item-desc-top');

  const $title = document.createElement('div');
  $title.classList.add('preview-item-title');
  $title.innerHTML = title;

  const $duration = document.createElement('div');
  $duration.classList.add('preview-item-duration');
  $duration.innerHTML = `${toMinutesString(duration)} (${rate}x)`;

  $descTop.appendChild($title);
  $descTop.appendChild($duration);

  const $descBottom = document.createElement('div');
  $descBottom.classList.add('preview-item-desc-bottom');

  const $start = document.createElement('div');
  $start.classList.add('preview-item-start');
  $start.innerHTML = toMinutesString(start);
  $descBottom.appendChild($start);

  const $end = document.createElement('div');
  $end.classList.add('preview-item-end');
  $end.innerHTML = toMinutesString(start + duration);
  $descBottom.appendChild($end);

  $item.appendChild($descTop);
  $item.appendChild($descBottom);

  return $item;
}

function toMinutesString(duration) {
  const min = Math.floor(duration / 60);
  const secRest = Math.floor(duration % 60);
  return `${min}m ${secRest}s`;
}
