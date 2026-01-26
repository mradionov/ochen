import { useAudioTimeline } from '../../../features/audio_timeline/use_audio_timeline';
import { useTimelineClock } from '../../../features/timeline_clock/use_timeline_clock';
import { useVideoTimeline } from '../../../features/video_timeline/use_video_timeline';
import { AudioTrack } from '../audio_track/audio_track';
import { PlayheadTrack } from '../playhead_track/playhead_track';
import { VideoTrack } from '../video_track/video_track';

export const Timeline = ({
  onPlayheadSeek,
}: {
  onPlayheadSeek: (newTime: number) => void;
}) => {
  const { videoTimelineSnap } = useVideoTimeline();
  const { audioTimeline } = useAudioTimeline();
  const { playheadTime, timelineClock } = useTimelineClock();

  const videoDuration = videoTimelineSnap.getTotalDuration();
  const audioDuration = audioTimeline.getTotalDuration();
  const maxDuration = Math.max(videoDuration, audioDuration);

  const onSeek = (newTime: number) => {
    timelineClock.seek(newTime);
    onPlayheadSeek(newTime);
  };

  return (
    <div>
      <PlayheadTrack
        time={playheadTime}
        maxDuration={maxDuration}
        onSeek={onSeek}
      />
      <VideoTrack maxDuration={maxDuration} />
      <AudioTrack maxDuration={maxDuration} />
    </div>
  );
};
