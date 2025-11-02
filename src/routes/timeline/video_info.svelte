<script lang='ts'>
  import type { VideoTimelineClip } from '$lib/video/video_timeline';
  import { toMinutesString } from '$lib/time_utils.js';
  import OffsetPicker from './offset_picker.svelte';
  import type { Manifest } from '$lib/manifest/manifest.svelte';

  export let manifest: Manifest;
  export let timelineClip: VideoTimelineClip;

  $: canMoveLeft = timelineClip.index > 0;
  $: canMoveRight = !timelineClip.isLast;

  function handleRateChange(e: Event & { currentTarget: HTMLInputElement }) {
    manifest.videoTrack.getClip(timelineClip.videoId).rate = Number(e.currentTarget.value);
  }

  function handleOffsetXChange(offsetX: number | string | undefined) {
    manifest.videoTrack.getClip(timelineClip.videoId).offsetX = offsetX;
  }

  function handleOffsetYChange(offsetY: number | string | undefined) {
    manifest.videoTrack.getClip(timelineClip.videoId).offsetY = offsetY;
  }

  function handleTrimEndChange(e: Event & { currentTarget: HTMLInputElement }) {
    manifest.videoTrack.getClip(timelineClip.videoId).trimEnd = Number(e.currentTarget.value);
  }

  function handleMoveLeft() {
    manifest.videoTrack.moveLeft(timelineClip.videoId);
  }

  function handleMoveRight() {
    manifest.videoTrack.moveRight(timelineClip.videoId);
  }
</script>

<div>
  <table>
    <tbody>
    <tr>
      <th class='head'>id</th>
      <td class='cell'>{timelineClip.videoId}</td>
    </tr>
    <tr>
      <th class='head'>index</th>
      <td class='cell'>{timelineClip.index}</td>
    </tr>
    <tr>
      <th class='head'>last</th>
      <td class='cell'>{timelineClip.isLast}</td>
    </tr>
    <tr class='divider'>
      <td colspan='2'></td>
    </tr>
    <tr>
      <th class='head'>start</th>
      <td class='cell'>{toMinutesString(timelineClip.start)}</td>
    </tr>
    <tr>
      <th class='head'>end</th>
      <td class='cell'>{toMinutesString(timelineClip.end)}</td>
    </tr>
    <tr>
      <th class='head'>duration</th>
      <td class='cell'>{toMinutesString(timelineClip.duration)}</td>
    </tr>
    <tr>
      <th class='head'>rated duration</th>
      <td class='cell'>{toMinutesString(timelineClip.ratedDuration)}</td>
    </tr>
    <tr>
      <th class='head'>rate</th>
      <td class='cell'>
        <input
          type='number'
          value={timelineClip.rate}
          min={0.1}
          step={0.1}
          max={10}
          on:change={handleRateChange}
        />
      </td>
    </tr>
    <tr>
      <th class='head'>source duration</th>
      <td class='cell'>{toMinutesString(timelineClip.sourceDuration)}</td>
    </tr>
    <tr>
      <th class='head'>trimmed duration</th>
      <td class='cell'>{toMinutesString(timelineClip.trimmedDuration)}</td>
    </tr>
    <tr class='divider'>
      <td colspan='2'></td>
    </tr>
    <tr>
      <th class='head'>trim end</th>
      <td class='cell'>
        <input
          type='number'
          on:change={handleTrimEndChange}
          value={timelineClip.clip.trimEnd}
        />
      </td>
    </tr>
    <tr class='divider'>
      <td colspan='2'></td>
    </tr>
    <tr>
      <th class='head'>offsetX</th>
      <td class='cell'>
        <OffsetPicker
          extraOptions={['left', 'center', 'right']}
          value={timelineClip.clip.offsetX}
          onChange={handleOffsetXChange}
        />
      </td>
    </tr>
    <tr>
      <th class='head'>offsetY</th>
      <td class='cell'>
        <OffsetPicker
          extraOptions={['top', 'center', 'bottom']}
          value={timelineClip.clip.offsetY}
          onChange={handleOffsetYChange}
        />
      </td>
    </tr>
    <tr class='divider'>
      <td colspan='2'></td>
    </tr>
    </tbody>
  </table>
  <button disabled={!canMoveLeft} on:click={handleMoveLeft}>Move &lt;</button>
  <button disabled={!canMoveRight} on:click={handleMoveRight}>Move &gt;</button>
</div>

<style>
  .head {
    text-align: right;
  }

  .cell {
    text-align: left;
  }

  .divider {
    padding: 0;
    height: 3px;
    background: #eee;
    border: 0;
  }
</style>
