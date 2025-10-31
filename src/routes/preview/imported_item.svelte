<script lang='ts'>
  import { toMinutesString } from '$lib/time_utils';
  import { getContext, onMount } from 'svelte';
  import { VideoResolverKey } from '$lib/di';
  import type { SourceVideoFile } from '$lib/projects/projects_controller';
  import { VideoResolver } from '$lib/video/video_resolver';
  import type { VideoMetadata } from '$lib/video/video_resolver';
  import PreviewBaseItem from './preview_base_item.svelte';

  export let sourceVideoFile: SourceVideoFile;
  export let onClip: () => void;
  export let onRemove: () => void;

  const videoResolver = getContext<VideoResolver>(VideoResolverKey);

  let videoMetadata: VideoMetadata;

  onMount(async () => {
    videoMetadata = await videoResolver.loadMetadataOne({
      videoId: sourceVideoFile.name,
      videoPath: sourceVideoFile.path
    });
  });
</script>

<PreviewBaseItem
  videoPath={sourceVideoFile.path}
  headerLeft={sourceVideoFile.name}
  headerRight={toMinutesString(videoMetadata?.duration)}
>
  <div slot='controls'>
    <button on:click={onClip}>clip</button>
    <button on:click={onRemove}>remove</button>
  </div>
</PreviewBaseItem>
