import type { AudioTimelineClip } from '../../../features/audio_timeline/audio_timeline_selectors';
import { useEditorState } from '../editor_state_provider';

import classes from './audio_clip.module.css';

export const AudioClip = ({
  timelineClip,
  maxDuration,
}: {
  timelineClip: AudioTimelineClip;
  maxDuration: number;
}) => {
  const { selectedAudioTimelineClip, selectAudioTimelineClip } =
    useEditorState();
  const isSelected =
    selectedAudioTimelineClip?.audioId === timelineClip.audioId;

  const width = (timelineClip.duration / maxDuration) * 100;

  return (
    <div
      className={classes.root}
      data-selected={isSelected}
      onClick={() => selectAudioTimelineClip(timelineClip.audioId)}
      style={{ width: `${width}%` }}
    >
      {timelineClip.audioId}
    </div>
  );
};
