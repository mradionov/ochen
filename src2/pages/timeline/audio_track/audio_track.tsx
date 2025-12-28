import type { AudioTimelineClip } from '../../../features/audio_timeline/audio_timeline_selectors';
import { useAudioTimeline } from '../../../features/audio_timeline/use_audio_timeline';
import { AudioClip } from './audio_clip';
import classes from './audio_track.module.css';

export const AudioTrack = ({
  maxDuration,
  selectedClip,
  onSelect,
}: {
  maxDuration: number;
  selectedClip: AudioTimelineClip | undefined;
  onSelect: (clip: AudioTimelineClip) => void;
}) => {
  const { audioTimeline } = useAudioTimeline();

  const clips = audioTimeline.getTimelineClips();

  return (
    <div className={classes.root}>
      {clips.map((clip) => (
        <AudioClip
          key={clip.audioId}
          timelineClip={clip}
          maxDuration={maxDuration}
          onSelect={onSelect}
          isSelected={selectedClip?.audioId === clip.audioId}
        />
      ))}
    </div>
  );
};
