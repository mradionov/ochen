<script lang="ts">
  import type { VideoPlayer } from '$lib/video/video_player';
  import { getContext, onMount } from 'svelte';
  import { Renderer } from '$lib/renderer/renderer';
  import { RenderLoop } from '$lib/render_loop';
  import { RenderLoopKey } from '$lib/di';
  import { VideoImageSource } from '$lib/renderer/image_source';
  import type { EffectsMap } from './effects.svelte';

  const renderLoop = getContext<RenderLoop>(RenderLoopKey);
  // renderLoop.start();

  export let player: VideoPlayer;
  export let effects: EffectsMap | undefined = undefined;
  export let nextPlayer: VideoPlayer | undefined = undefined;
  export let width: number = 800;
  export let height: number = 800;
  export let onClick: (() => void) | undefined = undefined;

  let canvasElement: HTMLCanvasElement;
  let renderer: Renderer;

  onMount(() => {
    renderer = Renderer.createFromCanvas(canvasElement);

    renderLoop.tick.addListener(() => {
      player.updateFrame();
      // nextPlayer?.updateFrame();

      const videoImageSource = new VideoImageSource(player.element);

      // TODO: compositor
      renderer.updateFrame(
        { imageSource: videoImageSource, effects },
        undefined,
      );
    });
  });
</script>

<canvas bind:this={canvasElement} {width} {height} onclick={onClick}></canvas>
