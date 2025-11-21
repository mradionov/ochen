<script lang="ts">
  import type { AudioTimelineClip } from '$lib/audio/audio_timeline.svelte';

  export let timelineClip: AudioTimelineClip;
  export let maxDuration: number;
  export let isSelected: boolean;
  export let onSelect: (clip: AudioTimelineClip) => void;

  $: width = (timelineClip.duration / maxDuration) * 100;

  function handleClick() {
    onSelect(timelineClip);
  }
</script>

<div
  class="container"
  class:selected={isSelected}
  onclick={handleClick}
  style="width: {width}%"
>
  {timelineClip.audioId}
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
    border: 1px solid green;
  }
</style>
