<script lang='ts'>
  import { toMinutesString } from '$lib/time_utils';
  import type { VideoTimelineClip } from '$lib/video/video_timeline';
  import { getContext, onMount } from 'svelte';
  import { RenderLoop } from '$lib/render_loop';
  import { PlayerFactoryKey, RenderLoopKey } from '$lib/di';
  import type { PlayerFactory } from '$lib/video/player_factory';
  import type { Player } from '$lib/video/player';

  export let timelineClip: VideoTimelineClip;

  const renderLoop = getContext<RenderLoop>(RenderLoopKey);
  const playerFactory = getContext<PlayerFactory>(PlayerFactoryKey);

  let canvasContainerElement: HTMLDivElement;

  let player: Player;

  onMount(async () => {
    player = await playerFactory.createForPreview(timelineClip.clip);
    // TODO: don't manipulate dom directly
    canvasContainerElement.appendChild(player.renderer.$canvas);

    renderLoop.tick.addListener(({ deltaTime }) => {
      player.update({ deltaTime });
    });
  });

  function onContainerClick() {
    player.togglePlay();
  }
</script>

<div class='container' on:click={onContainerClick}>
  <div bind:this={canvasContainerElement}></div>
  <div class='header'>
    <div class='title'>{timelineClip.videoId}</div>
    <div class='duration'>
      {toMinutesString(timelineClip.duration)} ({timelineClip.rate}x)
    </div>
  </div>
  <div class='footer'>
    <div class='start'>{toMinutesString(timelineClip.start)}</div>
    <div class='end'>{toMinutesString(timelineClip.end)}</div>
  </div>
</div>

<style>
  .container {
    width: 200px;
    height: 200px;
    background: #a1a1a1;
    display: inline-block;
    margin: 5px;
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
