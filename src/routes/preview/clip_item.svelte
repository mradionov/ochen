<script lang="ts">
  import { toMinutesString } from '$lib/time_utils';
  import type { VideoTimelineClip } from '$lib/video/video_timeline.svelte';
  import PreviewBaseItem from './preview_base_item.svelte';

  let {
    timelineClip,
    onMoveLeft,
    onMoveRight,
    onRename,
    onRemove,
  }: {
    timelineClip: VideoTimelineClip;
    onMoveLeft: (() => void) | undefined;
    onMoveRight: (() => void) | undefined;
    onRename?: (name: string) => void;
    onRemove: () => void;
  } = $props();

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
  videoTrimmedDuration={timelineClip.trimmedDuration}
  effects={timelineClip.clip.effects}
  headerLeft={timelineClip.videoId}
  headerRight={`${toMinutesString(timelineClip.duration)} (${timelineClip.rate}x)`}
  footerLeft={toMinutesString(timelineClip.start)}
  footerRight={toMinutesString(timelineClip.end)}
>
  {#snippet controls()}
    {#if onMoveLeft != null}
      <button onclick={onMoveLeft} disabled={timelineClip.isFirst}>&lt;</button>
    {/if}
    {#if onMoveRight != null}
      <button onclick={onMoveRight} disabled={timelineClip.isLast}>&gt;</button>
    {/if}
    {#if onRename != null}
      <button onclick={handleRename}>rename</button>
    {/if}
    <button onclick={onRemove}>remove</button>
  {/snippet}
</PreviewBaseItem>
