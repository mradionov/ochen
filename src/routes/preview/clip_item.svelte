<script lang='ts'>
  import { toMinutesString } from '$lib/time_utils';
  import type { VideoTimelineClip } from '$lib/video/video_timeline';
  import PreviewBaseItem from './preview_base_item.svelte';

  export let timelineClip: VideoTimelineClip;
  export let onMoveLeft: (() => void) | undefined = undefined;
  export let onMoveRight: (() => void) | undefined = undefined;
  export let onRename: ((name: string) => void) | undefined = undefined;
  export let onRemove: () => void;

  function handleRename() {
    const response = prompt(undefined, timelineClip.videoId);
    const name = (response ?? '').trim();
    if (name.length === 0) {
      return;
    }
    onRename?.(name);
  }
</script>

<PreviewBaseItem
  videoPath={timelineClip.clip.videoPath}
  headerLeft={timelineClip.videoId}
  headerRight={`${toMinutesString(timelineClip.duration)} (${timelineClip.rate}x)`}
  footerLeft={toMinutesString(timelineClip.start)}
  footerRight={toMinutesString(timelineClip.end)}
>
  <div slot='controls'>
    {#if onMoveLeft != null}
      <button on:click={onMoveLeft} disabled={timelineClip.isFirst}>&lt;</button>
    {/if}
    {#if onMoveRight != null}
      <button on:click={onMoveRight} disabled={timelineClip.isLast}>&gt;</button>
    {/if}
    {#if onRename != null}
      <button on:click={handleRename}>rename</button>
    {/if}
    <button on:click={onRemove}>remove</button>
  </div>
</PreviewBaseItem>
