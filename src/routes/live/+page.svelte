<script lang="ts">
  import { AudioCapture } from '$lib/audio/audio_capture';
  import { RenderLoopKey } from '$lib/di';
  import type { RenderLoop } from '$lib/render_loop';
  import { VideoCapture } from '$lib/video/video_capture';
  import RendererSurface from '$lib/renderer/renderer_surface.svelte';
  import { getContext, onMount } from 'svelte';
  import { VideoPlayer } from '$lib/video/video_player';
  import { EffectsMap } from '$lib/renderer/effects_map.svelte';
  import EffectsPanel from '$lib/renderer/effects_panel.svelte';

  const renderLoop = getContext<RenderLoop>(RenderLoopKey);
  const audioCapture = new AudioCapture();
  const videoCapture = new VideoCapture();

  let videoPlayer = $state<VideoPlayer | undefined>(undefined);
  let effects = $state(
    new EffectsMap({
      order: ['tint', 'edge', 'grain'],
      tint: '#ff0000',
      edge: {},
      grain: {},
    }),
  );

  onMount(async () => {
    await audioCapture.connect();
    const { video } = await videoCapture.connect();

    videoPlayer = VideoPlayer.createFromElement(video);

    renderLoop.tick.addListener(() => {
      const { data, bufferLength } = audioCapture.update();
      //   console.log(data);
    });

    handleStart();
  });

  function handleStart() {
    renderLoop.start();
    audioCapture.start();
  }

  function handleStop() {
    renderLoop.stop();
    audioCapture.stop();
  }
</script>

<div class="container">
  <div class="left">
    <button onclick={handleStart}>start</button>
    <button onclick={handleStop}>stop</button>
    {#if videoPlayer}
      <RendererSurface
        player={videoPlayer}
        {effects}
        width={600}
        height={600}
      />
    {/if}
  </div>
  <div class="right">
    <EffectsPanel {effects} />
  </div>
</div>

<style>
  .container {
    display: flex;
  }
  .left,
  .right {
    flex: 1;
    flex-direction: column;
    display: flex;
  }

  .left {
    align-items: flex-start;
  }
</style>
