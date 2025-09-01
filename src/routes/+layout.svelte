<script lang='ts'>
  import { setContext } from 'svelte';
  import { AudioResolverKey, PlayerFactoryKey, RenderLoopKey, VideoResolverKey } from '$lib/di';
  import { VideoResolver } from '$lib/video/video_resolver';
  import { AudioResolver } from '$lib/audio/audio_resolver';
  import { PlayerFactory } from '$lib/video/player_factory';
  import { RenderLoop } from '$lib/render_loop';

  const renderLoop = new RenderLoop();
  renderLoop.start();

  setContext(VideoResolverKey, new VideoResolver());
  setContext(AudioResolverKey, new AudioResolver());
  setContext(PlayerFactoryKey, new PlayerFactory());
  setContext(RenderLoopKey, renderLoop);
</script>

<slot />
