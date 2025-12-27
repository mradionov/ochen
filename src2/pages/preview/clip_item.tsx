import { Button, Group } from '@mantine/core';
import type { VideoTimelineClip } from '../../features/video_timeline/video_timeline';
import { PreviewBaseItem } from './preview_base_item';
import { toMinutesString } from '../../lib/time_utils';

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
    <Group gap="xs">
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
    </Group>
  );

  return (
    <PreviewBaseItem
      videoPath={timelineClip.clip.videoPath}
      videoTrimmedDuration={timelineClip.trimmedDuration}
      headerLeft={timelineClip.videoId}
      headerRight={`${toMinutesString(timelineClip.duration)} (${timelineClip.rate}x)`}
      footerLeft={toMinutesString(timelineClip.start)}
      footerRight={toMinutesString(timelineClip.end)}
      controls={controls}
    />
  );
};
