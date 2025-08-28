<script lang='ts'>
  import type { VideoPlayer } from '$lib/video_player';

  export let player: VideoPlayer;
  export let width: number = 300;

  let containerElement: HTMLDivElement;

  $: if (player && containerElement) {
    containerElement.innerHTML = '';
    containerElement.appendChild(player.element);
    player.element.width = width;
  }
</script>

<div class='container' bind:this={containerElement}></div>

<style>
  .container {
    position: relative;
  }

  :global(.container > canvas) {
    position: absolute;
    top: 0;
    bottom: 0;
  }

  :global(.container > canvas:first-child) {
    z-index: 3;
  }

  :global(.container > canvas:last-child) {
    z-index: 2;
  }
</style>
