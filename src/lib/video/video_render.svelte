<script lang='ts'>
  import type { VideoPlayer } from '$lib/video/video_player';
  import { getContext, onMount } from 'svelte';
  import { VideoRenderer } from '$lib/video/video_renderer';
  import { RenderLoop } from '$lib/render_loop';
  import { RenderLoopKey } from '$lib/di';

  const renderLoop = getContext<RenderLoop>(RenderLoopKey);

  export let player: VideoPlayer;
  export let width: number = 800;
  export let height: number = 800;

  let canvasElement: HTMLCanvasElement;
  let renderer: VideoRenderer;

  onMount(() => {
    renderer = new VideoRenderer(canvasElement);

    renderLoop.tick.addListener(() => {
      player.updateFrame();
      renderer.updateFrame(player);
    });
  });
</script>

<canvas bind:this={canvasElement} width={width} height={height}></canvas>
