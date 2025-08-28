<script lang='ts'>
  export let time: number;
  export let maxDuration: number;
  export let onSeek: (seekedToTime: number) => void;

  $: playheadX = time / maxDuration * 100;

  function handleTrackClick(e: MouseEvent) {
    const x = e.offsetX;
    const position = x / e.target.clientWidth;
    const seekedToTime = maxDuration * position;
    onSeek?.(seekedToTime);
  }
</script>

<div class='track' on:click={handleTrackClick}>
  <div class='playhead' style='left: {playheadX}%'></div>
</div>

<style>
  .track {
    height: 20px;
    width: 100%;
    background: green;
    position: relative;
  }

  .playhead {
    position: absolute;
    height: 100%;
    width: 3px;
    background: yellow;
  }
</style>
