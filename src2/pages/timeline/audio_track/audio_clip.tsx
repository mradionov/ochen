import type { AudioTimelineClip } from '../../../features/audio_timeline/audio_timeline_selectors';

import classes from './audio_clip.module.css';

export const AudioClip = ({
  timelineClip,
  isSelected,
  onSelect,
  maxDuration,
}: {
  timelineClip: AudioTimelineClip;
  isSelected: boolean;
  onSelect: (clip: AudioTimelineClip) => void;
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
      {timelineClip.audioId}
    </div>
  );
};
