<script lang='ts'>
  import { onMount } from 'svelte';
  import type { VideoTimeline, VideoTimelineClip } from '$lib/video_timeline';

  export let maxDuration: number;
  export let timelineClips: VideoTimelineClip[];

  onMount(() => {
  });
</script>

<div class='container'>

</div>

<style>
  .container {
    width: 100%;
    height: 50px;
    border: 1px solid red;
  }
</style>
