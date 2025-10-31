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
  import type { Manifest } from '$lib/manifest/manifest';
  import ManifestSaveButton from '$lib/manifest/manifest_save_button.svelte';
  import ClipItem from './clip_item.svelte';

  const projectsController = getContext<ProjectsController>(ProjectsControllerKey);
  const videoResolver = getContext<VideoResolver>(VideoResolverKey);

  let manifest: Manifest;
  let tint;
  let totalDuration = 0;
  let timelineClips: VideoTimelineClip[] = [];
  let importedVideoFiles: SourceVideoFile[] = [];
  let unimportedVideoFiles: SourceVideoFile[] = [];

  onMount(async () => {
    const projectName = await projectsController.fetchActiveProjectName();
    manifest = await new ManifestReader().read(projectName);
    console.log({ manifest });

    const importedNames = manifest.videoTrack.getVideoFilenames();

    const sourceVideoFiles = await projectsController.fetchActiveProjectVideoFiles();
    importedVideoFiles = sourceVideoFiles.filter(file => importedNames.includes(file.name));
    unimportedVideoFiles = sourceVideoFiles.filter(file => !importedNames.includes(file.name));
    console.log({ importedNames, sourceVideoFiles, importedVideoFiles, unimportedVideoFiles });

    await videoResolver.loadMetadata(manifest.videoTrack.clips);

    const timeline = new VideoTimeline(manifest, videoResolver);

    timelineClips = timeline.getTimelineClips();

    console.log({ timelineClips });

    totalDuration = timeline.getTotalDuration();
    tint = manifest.videoTrack?.effects?.tint;
    // TODO: on tint change
  });

  function handleAddClip(sourceVideoFile: SourceVideoFile) {
    manifest.videoTrack.addClip(sourceVideoFile.name, sourceVideoFile.path);
  }

  function handleRemoveImported(sourceVideoFile: SourceVideoFile) {
    manifest.videoTrack.removeVideo(sourceVideoFile.name);
  }

  function handleImport(sourceVideoFile: SourceVideoFile) {
    manifest.videoTrack.addVideo(sourceVideoFile.name);
  }
</script>

<div>
  <ManifestSaveButton manifest={manifest} />

  <div>total duration: {toMinutesString(totalDuration)}</div>
  <input type='color' bind:value={tint} />

  <hr />

  <h4>Clips</h4>
  <hr />

  {#each timelineClips as timelineClip (timelineClip.videoId)}
    <ClipItem timelineClip={timelineClip} />
  {/each}

  {#if importedVideoFiles.length > 0}
    <h4>Imported</h4>
    <hr />
    {#each importedVideoFiles as sourceVideoFile}
      <ImportedItem
        sourceVideoFile={sourceVideoFile}
        onClip={() => handleAddClip(sourceVideoFile)}
        onRemove={() => handleRemoveImported(sourceVideoFile)}
      />
    {/each}
  {/if}


  {#if unimportedVideoFiles.length > 0}
    <h4>Unimported</h4>
    <hr />
    {#each unimportedVideoFiles as sourceVideoFile}
      <UnimportedItem sourceVideoFile={sourceVideoFile} onImport={() => handleImport(sourceVideoFile)} />
    {/each}
  {/if}

</div>
