import type { VideoTimelineClip } from '../../../features/video_timeline/video_timeline_selectors';
import { useEditorState } from '../editor_state_provider';

import classes from './video_clip.module.css';

export const VideoClip = ({
  timelineClip,
  maxDuration,
}: {
  timelineClip: VideoTimelineClip;
  maxDuration: number;
}) => {
  const { selectedVideoTimelineClip, selectVideoTimelineClip } =
    useEditorState();
  const isSelected =
    selectedVideoTimelineClip?.videoId === timelineClip.videoId;

  const width = (timelineClip.duration / maxDuration) * 100;

  return (
    <div
      className={classes.root}
      data-selected={isSelected}
      onClick={() => selectVideoTimelineClip(timelineClip.videoId)}
      style={{ width: `${width}%` }}
    >
      {timelineClip.videoId}
    </div>
  );
};
