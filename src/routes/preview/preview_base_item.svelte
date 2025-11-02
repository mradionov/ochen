<script lang='ts'>
  import { getContext, onMount } from 'svelte';
  import { RenderLoop } from '$lib/render_loop';
  import { PlayerFactoryKey, RenderLoopKey } from '$lib/di';
  import type { PlayerFactory } from '$lib/video/player_factory';
  import type { Player } from '$lib/video/player';

  export let videoPath: string;
  export let headerLeft: string | undefined = undefined;
  export let headerRight: string | undefined = undefined;
  export let footerLeft: string | undefined = undefined;
  export let footerRight: string | undefined = undefined;

  const renderLoop = getContext<RenderLoop>(RenderLoopKey);
  const playerFactory = getContext<PlayerFactory>(PlayerFactoryKey);

  let canvasContainerElement: HTMLDivElement;

  let player: Player;

  onMount(async () => {
    player = await playerFactory.createForPreview(videoPath);
    // TODO: don't manipulate dom directly
    canvasContainerElement.appendChild(player.renderer.$canvas);

    renderLoop.tick.addListener(() => {
      player.update();
    });
  });

  function onCanvasClick() {
    player.togglePlay();
  }
</script>

<div class='container'>
  <div bind:this={canvasContainerElement} on:click={onCanvasClick}></div>
  <div class='header'>
    <div>{headerLeft}</div>
    <div>{headerRight}</div>
  </div>
  <div class='footer'>
    <div>{footerLeft}</div>
    <div>{footerRight}</div>
  </div>
  <div>
    <slot name='controls'></slot>
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
