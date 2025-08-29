<script lang='ts'>
  import type { VideoTimelineClip } from '$lib/video_timeline';

  export let timelineClip: VideoTimelineClip;
  export let maxDuration: number;
  export let onSelect: (clip: VideoTimelineClip) => void;

  $: width = timelineClip.duration / maxDuration * 100;

  function handleClick() {
    onSelect(timelineClip);
  }
</script>

<div class='container' on:click={handleClick} style='width: {width}%'>
  {timelineClip.videoId}
</div>

<style>
  .container {
    height: 100%;
    overflow: hidden;
  }

  .container:nth-child(odd) {
    background: #eee;
  }
</style>
