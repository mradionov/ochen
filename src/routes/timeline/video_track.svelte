<script lang='ts'>
  import type { VideoTimelineClip } from '$lib/video_timeline';
  import VideoClip from './video_clip.svelte';

  export let timelineClips: VideoTimelineClip[];
  export let maxDuration: number;
</script>

<div class='container'>
  {#each timelineClips as timelineClip}
    <VideoClip timelineClip={timelineClip} maxDuration={maxDuration} />
  {/each}
</div>

<style>
  .container {
    width: 100%;
    height: 50px;
    border: 1px solid red;
    display: flex;
  }
</style>
