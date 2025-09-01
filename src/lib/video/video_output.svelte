<script lang='ts'>
  import type { VideoPlayer } from '$lib/video/video_player';

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
