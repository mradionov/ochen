<script lang='ts'>
  import type { VideoPreview } from '$lib/video/video_preview_factory';
  import { onMount } from 'svelte';

  let containerElement: HTMLDivElement;

  export let videoPreview: VideoPreview;

  onMount(() => {
    containerElement.appendChild(videoPreview.renderer.canvas);
  });

</script>

<div bind:this={containerElement}></div>
