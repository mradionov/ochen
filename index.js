import {openPerformance} from "./src/performance.js";
import {openPreview} from "./src/preview.js";

const {searchParams} = new URL(window.location);

const $page = document.querySelector('#main-page');

const SET_ID = '03_jrugz';

switch (searchParams.get('page')) {
  case 'perf':
    void openPerformance(SET_ID);
    break;
  case 'prev':
    void openPreview(SET_ID);
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
