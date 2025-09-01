<script lang='ts'>
  import type { VideoTimelineClip } from '$lib/video/video_timeline';
  import { toMinutesString } from '$lib/time_utils.js';

  export let timelineClip: VideoTimelineClip;

  $: rows = [
    ['id', timelineClip.videoId],
    ['index', timelineClip.index],
    ['isLast', timelineClip.isLast],
    ['start', toMinutesString(timelineClip.start)],
    ['end', toMinutesString(timelineClip.end)],
    ['rate', timelineClip.rate],
    ['duration', toMinutesString(timelineClip.duration)]
  ];

  $: canMoveLeft = timelineClip.index > 0;
  $: canMoveRight = !timelineClip.isLast;
</script>

<div>
  <table>
    <tbody>
    {#each rows as row}
      <tr>
        <th class='head'>{row[0]}</th>
        <td class='cell'>{row[1]}</td>
      </tr>
    {/each}
    </tbody>
  </table>
  <button disabled={!canMoveLeft}>Move &lt;</button>
  <button disabled={!canMoveRight}>Move &gt;</button>
</div>

<style>
  .head {
    text-align: right;
  }

  .cell {
    text-align: left;
  }
</style>
