import type { VideoTimelineClip } from '../../features/video_timeline/video_timeline_selectors';
import { toMinutesString } from '../../lib/time_utils';
import { PreviewBaseItem } from './preview_base_item';
import { Button, Group } from '@mantine/core';

export const ClipItem = ({
  timelineClip,
  onMoveLeft,
  onMoveRight,
  onRemove,
}: {
  timelineClip: VideoTimelineClip;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRemove: () => void;
}) => {
  const controls = (
    <>
      <Button
        size="compact-xs"
        onClick={onMoveLeft}
        disabled={timelineClip.isFirst}
      >
        &lt;
      </Button>
      <Button
        size="compact-xs"
        onClick={onMoveRight}
        disabled={timelineClip.isLast}
      >
        &gt;
      </Button>
      <Button size="compact-xs" onClick={onRemove}>
        Remove
      </Button>
    </>
  );

  return (
    <PreviewBaseItem
      videoPath={timelineClip.clip.videoPath}
      videoTrimmedDuration={timelineClip.trimmedDuration}
      headerLeft={timelineClip.videoId}
      headerRight={`${toMinutesString(timelineClip.duration)} (${timelineClip.rate}x)`}
      footerLeft={toMinutesString(timelineClip.start)}
      footerRight={toMinutesString(timelineClip.end)}
      effectsState={timelineClip.clip.effects}
      controls={controls}
    />
  );
};
