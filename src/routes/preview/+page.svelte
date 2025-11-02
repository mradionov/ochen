<script lang='ts'>
  import { getContext, onMount } from 'svelte';
  import { ManifestReader } from '$lib/manifest/manifest_reader';
  import { ProjectsControllerKey, VideoResolverKey } from '$lib/di';
  import { VideoTimeline } from '$lib/video/video_timeline';
  import type { VideoTimelineClip } from '$lib/video/video_timeline';
  import { VideoResolver } from '$lib/video/video_resolver';
  import { toMinutesString } from '$lib/time_utils';
  import ImportedItem from './imported_item.svelte';
  import UnimportedItem from './unimported_item.svelte';
  import { ProjectsController } from '$lib/projects/projects_controller';
  import type { SourceVideoFile } from '$lib/projects/projects_controller';
  import ManifestSaveButton from '$lib/manifest/manifest_save_button.svelte';
  import { Manifest } from '$lib/manifest/manifest.svelte';
  import ClipItem from './clip_item.svelte';

  const projectsController = getContext<ProjectsController>(ProjectsControllerKey);
  const videoResolver = getContext<VideoResolver>(VideoResolverKey);

  let manifest = $state<Manifest>(Manifest.createEmpty());

  console.log({ manifest });

  let importedNames = $derived(manifest.videoTrack.getVideoFilenames());
  let sourceVideoFiles = $state<SourceVideoFile[]>([]);
  let importedVideoFiles = $derived(sourceVideoFiles.filter(file => importedNames.includes(file.name)));
  let unimportedVideoFiles = $derived(sourceVideoFiles.filter(file => !importedNames.includes(file.name)));

  let timeline = $state(new VideoTimeline(manifest, videoResolver));
  let timelineClips = $derived(timeline.getTimelineClips());

  let totalDuration = $derived(timeline.getTotalDuration());
  let tint = $derived(manifest.videoTrack.effects?.tint);

  onMount(async () => {
    const projectName = await projectsController.fetchActiveProjectName();
    manifest = await new ManifestReader().read(projectName);
    console.log({ manifest });

    sourceVideoFiles = await projectsController.fetchActiveProjectVideoFiles();

    await videoResolver.loadMetadata(manifest.videoTrack.clips);

    timeline = new VideoTimeline(manifest, videoResolver);
  });

  function handleMoveLeft(timelineClip: VideoTimelineClip) {
    manifest.videoTrack.moveLeft(timelineClip.videoId);
  }

  function handleMoveRight(timelineClip: VideoTimelineClip) {
    manifest.videoTrack.moveRight(timelineClip.videoId);
  }

  function handleRemoveClip(timelineClip: VideoTimelineClip) {
    manifest.videoTrack.removeClip(timelineClip.videoId);
    manifest.videoTrack.removeVideo(timelineClip.videoId);
  }

  function handleImport(sourceVideoFile: SourceVideoFile) {
    manifest.videoTrack.addVideo(sourceVideoFile.name);
    manifest.videoTrack.addClip(sourceVideoFile.name, sourceVideoFile.path);
  }
</script>

<div>
  <ManifestSaveButton manifest={manifest} />

  <div>total duration: {toMinutesString(totalDuration)}</div>
  <input type='color' bind:value={tint} />

  <hr />

  {#if timelineClips.length > 0}
    <h4>Clips</h4>
    <hr />

    {#each timelineClips as timelineClip (timelineClip.videoId)}
      <ClipItem
        timelineClip={timelineClip}
        onMoveLeft={() => handleMoveLeft(timelineClip)}
        onMoveRight={() => handleMoveRight(timelineClip)}
        onRemove={() => handleRemoveClip(timelineClip)}
      />
    {/each}
  {/if}

  <!--{#if importedVideoFiles.length > 0}-->
  <!--  <h4>Imported</h4>-->
  <!--  <hr />-->
  <!--  {#each importedVideoFiles as sourceVideoFile (sourceVideoFile.name)}-->
  <!--    <ImportedItem-->
  <!--      sourceVideoFile={sourceVideoFile}-->
  <!--    />-->
  <!--  {/each}-->
  <!--{/if}-->

  {#if unimportedVideoFiles.length > 0}
    <h4>Unimported</h4>
    <hr />
    {#each unimportedVideoFiles as sourceVideoFile (sourceVideoFile.name)}
      <UnimportedItem sourceVideoFile={sourceVideoFile} onImport={() => handleImport(sourceVideoFile)} />
    {/each}
  {/if}

</div>
