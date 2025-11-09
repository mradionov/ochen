<script lang='ts'>
  import type { VideoTimelineClip } from '$lib/video/video_timeline.svelte';

  export let timelineClip: VideoTimelineClip;
  export let maxDuration: number;
  export let isSelected: boolean;
  export let onSelect: (clip: VideoTimelineClip) => void;

  $: width = timelineClip.duration / maxDuration * 100;

  function handleClick() {
    onSelect(timelineClip);
  }
</script>

<div
  class='container'
  class:selected={isSelected}
  on:click={handleClick}
  style='width: {width}%'
>
  {timelineClip.videoId}
</div>

<style>
  .container {
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }

  .container:nth-child(odd) {
    background: #eee;
  }

  .selected {
    border: 1px solid blue;
  }
</style>
