<script lang='ts'>
  import { toMinutesString } from '$lib/time_utils';
  import type { VideoTimelineClip } from '$lib/video/video_timeline';
  import PreviewBaseItem from './preview_base_item.svelte';

  export let timelineClip: VideoTimelineClip;
</script>

<PreviewBaseItem
  videoPath={timelineClip.clip.videoPath}
  headerLeft={timelineClip.videoId}
  headerRight={`${toMinutesString(timelineClip.duration)} (${timelineClip.rate}x)`}
  footerLeft={toMinutesString(timelineClip.start)}
  footerRight={toMinutesString(timelineClip.end)}
/>
