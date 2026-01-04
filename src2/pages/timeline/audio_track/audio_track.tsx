import { useAudioTimeline } from '../../../features/audio_timeline/use_audio_timeline';
import { AudioClip } from '../audio_clip/audio_clip';
import classes from './audio_track.module.css';

export const AudioTrack = ({ maxDuration }: { maxDuration: number }) => {
  const { audioTimeline } = useAudioTimeline();

  const clips = audioTimeline.getTimelineClips();

  return (
    <div className={classes.root}>
      {clips.map((clip) => (
        <AudioClip
          key={clip.audioId}
          timelineClip={clip}
          maxDuration={maxDuration}
        />
      ))}
    </div>
  );
};
