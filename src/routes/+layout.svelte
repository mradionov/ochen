<script lang="ts">
  import { setContext } from 'svelte';
  import {
    AudioResolverKey,
    ImageResolverKey,
    ProjectsControllerKey,
    RenderLoopKey,
    VideoPreviewFactoryKey,
    VideoResolverKey,
  } from '$lib/di';
  import { VideoResolver } from '$lib/video/video_resolver';
  import { AudioResolver } from '$lib/audio/audio_resolver';
  import { RenderLoop } from '$lib/render_loop';
  import { ProjectsController } from '$lib/projects/projects_controller';
  import { ProjectsRepo } from '$lib/projects/projects_repo';
  import { Database } from '$lib/database';
  import { VideoPreviewFactory } from '$lib/video/video_preview_factory';
  import { ImageResolver } from '$lib/image/image_resolver';

  const db = new Database();
  const dirHandlesRepo = new ProjectsRepo(db);
  const setsDir = new ProjectsController(dirHandlesRepo);

  const renderLoop = new RenderLoop();

  const videoResolver = new VideoResolver();
  const videoPreviewFactory = new VideoPreviewFactory();

  setContext(ProjectsControllerKey, setsDir);
  setContext(VideoResolverKey, videoResolver);
  setContext(AudioResolverKey, new AudioResolver());
  setContext(ImageResolverKey, new ImageResolver());
  setContext(VideoPreviewFactoryKey, videoPreviewFactory);
  setContext(RenderLoopKey, renderLoop);
</script>

<slot />
