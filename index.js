import {openPerformance} from "./performance.js";
import {openPreview} from "./preview.js";

const {searchParams} = new URL(window.location);

const $page = document.querySelector('#main-page');

switch (searchParams.get('page')) {
  case 'perf':
    void openPerformance();
    break;
  case 'prev':
    void openPreview();
    break;
  default:
    $page.style.display = 'block';
}

document.querySelector('#main-performance').addEventListener('click', () => {
  location.href = '?page=perf';
});

document.querySelector('#main-preview').addEventListener('click', () => {
  location.href = '?page=prev';
});
