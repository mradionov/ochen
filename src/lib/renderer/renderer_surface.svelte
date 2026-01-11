<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import { Renderer } from '$lib/renderer/renderer';
  import { RenderLoop } from '$lib/render_loop';
  import { RenderLoopKey } from '$lib/di';
  import type { EffectsMap } from './effects_map.svelte';
  import type { AudioInfo } from '$lib/audio/audio_analyser';
  import type { RenderablePlayer } from '$lib/video/renderable_player';

  const renderLoop = getContext<RenderLoop>(RenderLoopKey);
  // renderLoop.start();

  export let player: RenderablePlayer;
  export let effects: EffectsMap | undefined = undefined;
  export let audioInfo: AudioInfo | undefined = undefined;
  export let offset:
    | {
        offsetX: number | string | undefined;
        offsetY: number | string | undefined;
      }
    | undefined = undefined;
  export let nextPlayer: RenderablePlayer | undefined = undefined;
  export let width: number = 800;
  export let height: number = 800;
  export let onClick: (() => void) | undefined = undefined;
  export let onCanvasReady: (canvas: HTMLCanvasElement) => void;

  let canvasElement: HTMLCanvasElement;
  let renderer: Renderer;

  onMount(() => {
    onCanvasReady(canvasElement);
    renderer = Renderer.createFromCanvas(canvasElement);

    renderLoop.tick.addListener(({ lastTime }) => {
      player.updateFrame();
      // nextPlayer?.updateFrame();

      const renderSource = player.createRenderSource();

      // TODO: compositor
      renderer.updateFrame(
        { renderSource, effects, offset, lastTime, audioInfo },
        undefined,
      );
    });
  });
</script>

<canvas bind:this={canvasElement} {width} {height} onclick={onClick}></canvas>
