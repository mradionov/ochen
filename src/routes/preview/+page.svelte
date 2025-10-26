<script lang='ts'>
  import { getContext, onMount } from 'svelte';
  import { ManifestReader } from '$lib/manifest/manifest_reader';
  import { ProjectsControllerKey, VideoResolverKey } from '$lib/di';
  import { VideoTimeline } from '$lib/video/video_timeline';
  import type { VideoTimelineClip } from '$lib/video/video_timeline';
  import { VideoResolver } from '$lib/video/video_resolver';
  import { toMinutesString } from '$lib/time_utils';
  import PreviewItem from './preview_item.svelte';
  import { ProjectsController } from '$lib/projects/projects_controller';

  const projectsController = getContext<ProjectsController>(ProjectsControllerKey);
  const videoResolver = getContext<VideoResolver>(VideoResolverKey);

  let tint;
  let totalDuration = 0;
  let timelineClips: VideoTimelineClip[] = [];

  onMount(async () => {
    const projectName = await projectsController.fetchActiveProjectName();
    const manifest = await new ManifestReader().read(projectName);
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
