<script lang='ts'>
  import { setContext } from 'svelte';
  import {
    AudioResolverKey,
    ProjectsControllerKey,
    RenderLoopKey,
    VideoPreviewFactoryKey,
    VideoResolverKey
  } from '$lib/di';
  import { VideoResolver } from '$lib/video/video_resolver';
  import { AudioResolver } from '$lib/audio/audio_resolver';
  import { RenderLoop } from '$lib/render_loop';
  import { ProjectsController } from '$lib/projects/projects_controller';
  import { ProjectsRepo } from '$lib/projects/projects_repo';
  import { Database } from '$lib/database';
  import { VideoPreviewFactory } from '$lib/video/video_preview_factory';

  const db = new Database();
  const dirHandlesRepo = new ProjectsRepo(db);
  const setsDir = new ProjectsController(dirHandlesRepo);

  const renderLoop = new RenderLoop();
  renderLoop.start();

  const videoResolver = new VideoResolver();
  const videoPreviewFactory = new VideoPreviewFactory(videoResolver);

  setContext(ProjectsControllerKey, setsDir);
  setContext(VideoResolverKey, videoResolver);
  setContext(AudioResolverKey, new AudioResolver());
  setContext(VideoPreviewFactoryKey, videoPreviewFactory);
  setContext(RenderLoopKey, renderLoop);
</script>

<slot />
