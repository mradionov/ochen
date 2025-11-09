<script lang="ts">
  import { getContext, mount, onMount, type Snippet } from 'svelte';
  import type {
    VideoPreview,
    VideoPreviewFactory,
  } from '$lib/video/video_preview_factory';
  import type { VideoEffects } from '$lib/manifest/manifest.svelte';
  import { RenderLoopKey, VideoPreviewFactoryKey } from '$lib/di';
  import type { RenderLoop } from '$lib/render_loop';

  const renderLoop = getContext<RenderLoop>(RenderLoopKey);
  const videoPreviewFactory = getContext<VideoPreviewFactory>(
    VideoPreviewFactoryKey,
  );

  let canvasContainerElement: HTMLDivElement;

  let {
    controls,
    videoPath,
    videoTrimmedDuration,
    effects,
    videoPreview,
    headerLeft,
    headerRight,
    footerLeft,
    footerRight,
  }: {
    controls?: Snippet;
    videoPath: string;
    videoTrimmedDuration?: number;
    effects?: VideoEffects;
    videoPreview?: VideoPreview | undefined;
    headerLeft?: string;
    headerRight?: string;
    footerLeft?: string;
    footerRight?: string;
  } = $props();

  onMount(async () => {
    videoPreview = await videoPreviewFactory.create(videoPath, {
      trimmedDuration: videoTrimmedDuration,
    });

    renderLoop.tick.addListener(() => {
      if (videoPreview?.player.isPlaying) {
        videoPreview?.update({ effects });
      }
    });
  });

  $effect(() => {
    if (videoPreview && canvasContainerElement) {
      canvasContainerElement.appendChild(videoPreview.renderer.canvas);
    }
  });

  $effect(() => {
    if (videoPreview && effects) {
      videoPreview.update({ effects });
    }
  });

  function handleCanvasClick() {
    videoPreview?.togglePlay();
  }
</script>

<div class="container">
  <div bind:this={canvasContainerElement} onclick={handleCanvasClick}></div>
  <div class="header">
    <div>{headerLeft}</div>
    <div>{headerRight}</div>
  </div>
  <div class="footer">
    <div>{footerLeft}</div>
    <div>{footerRight}</div>
  </div>
  <div>
    {@render controls?.()}
  </div>
</div>

<style>
  .container {
    width: 200px;
    height: 200px;
    background: #a1a1a1;
    display: inline-block;
    margin: 5px;
    margin-bottom: 50px;
    position: relative;
  }

  .header,
  .footer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 20px;
    padding: 4px;
    display: flex;
    justify-content: space-between;
    font: 10px sans-serif;
    color: #eee;
  }

  .footer {
    bottom: 0;
    top: auto;
  }
</style>
