<script lang='ts'>
  import type { VideoTimelineClip } from '$lib/video/video_timeline.svelte';
  import VideoClip from './video_clip.svelte';

  export let timelineClips: VideoTimelineClip[];
  export let maxDuration: number;
  export let selectedTimelineClip: VideoTimelineClip | undefined;
  export let onSelect: (clip: VideoTimelineClip) => void;
</script>

<div class='container'>
  {#each timelineClips as timelineClip (timelineClip.videoId)}
    <VideoClip
      timelineClip={timelineClip}
      maxDuration={maxDuration}
      isSelected={selectedTimelineClip?.videoId === timelineClip.videoId}
      onSelect={onSelect} />
  {/each}
</div>

<style>
  .container {
    width: 100%;
    height: 50px;
    border: 1px solid red;
    box-sizing: border-box;
    display: flex;
  }
</style>
