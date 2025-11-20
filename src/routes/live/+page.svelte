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
  import { AudioAnalyser, type AudioInfo } from '$lib/audio/audio_analyser';

  const renderLoop = getContext<RenderLoop>(RenderLoopKey);
  const audioCapture = new AudioCapture();
  const videoCapture = new VideoCapture();
  const audioAnalyser = new AudioAnalyser();

  let contentElement: HTMLDivElement;

  let isLive = $state(true);
  let audioInfo = $state<AudioInfo | undefined>(undefined);

  let videoPlayer = $state<VideoPlayer | undefined>(undefined);
  let effects = $state(
    new EffectsMap({
      order: ['tint', 'edge', 'grain'],
      tint: '#ff0000',
      edge: {},
      grain: {},
      glitch: {},
    }),
  );

  onMount(async () => {
    await audioCapture.connect();
    const { video } = await videoCapture.connect();

    videoPlayer = VideoPlayer.createFromElement(video);

    renderLoop.tick.addListener(() => {
      const { data, sampleRate, fftSize } = audioCapture.update();
      audioInfo = audioAnalyser.process(data, sampleRate);
    });

    handleStart();
  });

  function handleIsLive(event) {
    isLive = event.target?.checked;
  }

  function handleStart() {
    renderLoop.start();
    audioCapture.start();
  }

  function handleStop() {
    renderLoop.stop();
    audioCapture.stop();
  }

  function handleFullscreen() {
    contentElement.requestFullscreen();
  }
</script>

<div class="container">
  <div class="left">
    <button onclick={handleFullscreen}> fullscreen </button>
    <button onclick={handleStart}>start</button>
    <button onclick={handleStop}>stop</button>
    <input type="checkbox" checked={isLive} onchange={handleIsLive} />live

    {#if videoPlayer}
      <div class="content" bind:this={contentElement}>
        <RendererSurface
          player={videoPlayer}
          audioInfo={isLive ? audioInfo : undefined}
          {effects}
          width={800}
          height={800}
        />
      </div>
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

  .content {
    position: relative;
    padding-left: 400px;
  }
</style>
