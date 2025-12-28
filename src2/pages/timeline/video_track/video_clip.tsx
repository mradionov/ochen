import type { VideoTimelineClip } from '../../../features/video_timeline/video_timeline_selectors';

import classes from './video_clip.module.css';

export const VideoClip = ({
  timelineClip,
  isSelected,
  onSelect,
  maxDuration,
}: {
  timelineClip: VideoTimelineClip;
  isSelected: boolean;
  onSelect: (clip: VideoTimelineClip) => void;
  maxDuration: number;
}) => {
  const width = (timelineClip.duration / maxDuration) * 100;

  return (
    <div
      className={classes.root}
      data-selected={isSelected}
      onClick={() => onSelect(timelineClip)}
      style={{ width: `${width}%` }}
    >
      {timelineClip.videoId}
    </div>
  );
};
