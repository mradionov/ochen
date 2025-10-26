<script lang='ts'>
  import { setContext } from 'svelte';
  import { AudioResolverKey, ProjectsControllerKey, PlayerFactoryKey, RenderLoopKey, VideoResolverKey } from '$lib/di';
  import { VideoResolver } from '$lib/video/video_resolver';
  import { AudioResolver } from '$lib/audio/audio_resolver';
  import { PlayerFactory } from '$lib/video/player_factory';
  import { RenderLoop } from '$lib/render_loop';
  import { ProjectsController } from '$lib/projects/projects_controller';
  import { ProjectsRepo } from '$lib/projects/projects_repo';
  import { Database } from '$lib/database';

  const db = new Database();
  const dirHandlesRepo = new ProjectsRepo(db);
  const setsDir = new ProjectsController(dirHandlesRepo);

  const renderLoop = new RenderLoop();
  renderLoop.start();

  setContext(ProjectsControllerKey, setsDir);
  setContext(VideoResolverKey, new VideoResolver());
  setContext(AudioResolverKey, new AudioResolver());
  setContext(PlayerFactoryKey, new PlayerFactory());
  setContext(RenderLoopKey, renderLoop);
</script>

<slot />
