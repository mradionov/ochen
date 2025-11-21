<script lang="ts">
  import AudioClip from './audio_clip.svelte';
  import type { AudioTimelineClip } from '$lib/audio/audio_timeline.svelte';

  export let timelineClips: AudioTimelineClip[];
  export let maxDuration: number;
  export let selectedTimelineClip: AudioTimelineClip | undefined;
  export let onSelect: (clip: AudioTimelineClip) => void;
</script>

<div class="container">
  {#each timelineClips as timelineClip}
    <AudioClip
      {timelineClip}
      {maxDuration}
      isSelected={selectedTimelineClip?.audioId === timelineClip.audioId}
      {onSelect}
    />
  {/each}
</div>

<style>
  .container {
    width: 100%;
    height: 50px;
    border: 1px solid blue;
    box-sizing: border-box;
    display: flex;
  }
</style>
