<script lang="ts">
  import { toMinutesString } from '$lib/time_utils.js';
  import type { Manifest } from '$lib/manifest/manifest.svelte';
  import type { AudioTimelineClip } from '$lib/audio/audio_timeline.svelte';

  export let manifest: Manifest;
  export let timelineClip: AudioTimelineClip;
  export let playheadTime: number;

  function handleTrimEndChange(e: Event & { currentTarget: HTMLInputElement }) {
    manifest.audioTrack.getClip(timelineClip.audioId).trimEnd = Number(
      e.currentTarget.value,
    );
  }
</script>

<div>
  <table>
    <tbody>
      <tr>
        <th class="head">id</th>
        <td class="cell">{timelineClip.videoId}</td>
      </tr>
      <tr>
        <th class="head">index</th>
        <td class="cell">{timelineClip.index}</td>
      </tr>
      <tr>
        <th class="head">last</th>
        <td class="cell">{timelineClip.isLast}</td>
      </tr>
      <tr class="divider">
        <td colspan="2"></td>
      </tr>
      <tr>
        <th class="head">start</th>
        <td class="cell">{toMinutesString(timelineClip.start)}</td>
      </tr>
      <tr>
        <th class="head">end</th>
        <td class="cell">{toMinutesString(timelineClip.end)}</td>
      </tr>
      <tr>
        <th class="head">duration</th>
        <td class="cell">{toMinutesString(timelineClip.duration)}</td>
      </tr>
      <tr>
        <th class="head">source duration</th>
        <td class="cell">{toMinutesString(timelineClip.sourceDuration)}</td>
      </tr>
      <tr>
        <th class="head">trimmed duration</th>
        <td class="cell">{toMinutesString(timelineClip.trimmedDuration)}</td>
      </tr>
      <tr class="divider">
        <td colspan="2"></td>
      </tr>
      <tr>
        <th class="head">time left</th>
        <td class="cell">
          {playheadTime > timelineClip.end || playheadTime < timelineClip.start
            ? '-'
            : toMinutesString(timelineClip.end - playheadTime, true)}
        </td>
      </tr>
      <tr class="divider">
        <td colspan="2"></td>
      </tr>
      <tr>
        <th class="head">trim end</th>
        <td class="cell">
          <input
            type="number"
            on:change={handleTrimEndChange}
            value={timelineClip.clip.trimEnd}
          />
        </td>
      </tr>
      <tr class="divider">
        <td colspan="2"></td>
      </tr>
    </tbody>
  </table>
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
