<script lang='ts'>
  import type { AudioTimelineClip } from '$lib/audio/audio_timeline';

  export let timelineClip: AudioTimelineClip;
  export let maxDuration: number;

  $: width = timelineClip.duration / maxDuration * 100;
</script>

<div class='container' style='width: {width}%'>
  {timelineClip.audioId}
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
