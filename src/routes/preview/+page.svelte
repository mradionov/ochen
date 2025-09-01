<script lang='ts'>
  import { getContext, onMount } from 'svelte';
  import { ManifestReader } from '$lib/manifest/manifest_reader';
  import { VideoResolverKey } from '$lib/di';
  import { VideoTimeline } from '$lib/video/video_timeline';
  import type { VideoTimelineClip } from '$lib/video/video_timeline';
  import { VideoResolver } from '$lib/video/video_resolver';
  import { toMinutesString } from '$lib/time_utils';
  import PreviewItem from './preview_item.svelte';

  const videoResolver = getContext<VideoResolver>(VideoResolverKey);

  let tint;
  let totalDuration = 0;
  let timelineClips: VideoTimelineClip[] = [];

  onMount(async () => {
    const setId = '03_jrugz';
    const manifest = await new ManifestReader().read(setId);
    console.log({ manifest });

    await videoResolver.loadMetadata(manifest.videoTrack.clips);
    const timeline = new VideoTimeline(manifest, videoResolver);

    timelineClips = timeline.getTimelineClips();
    totalDuration = timeline.getTotalDuration();
    tint = manifest.videoTrack?.effects?.tint;
    // TODO: on tint change
  });
</script>

<div>
  <div>total duration: {toMinutesString(totalDuration)}</div>
  <input type='color' bind:value={tint} />

  <hr />

  {#each timelineClips as timelineClip (timelineClip.videoId)}
    <PreviewItem timelineClip={timelineClip} />
  {/each}
</div>
