import { useAudioTimeline } from '../../../features/audio_timeline/use_audio_timeline';
import { useVideoTimeline } from '../../../features/video_timeline/use_video_timeline';
import { AudioTrack } from '../audio_track/audio_track';
import { PlayheadTrack } from '../playhead_track/playhead_track';
import { VideoTrack } from '../video_track/video_track';
import { useTimelineClock } from '../use_timeline_clock';

export const Timeline = ({
  onPlayheadSeek,
}: {
  onPlayheadSeek: (newTime: number) => void;
}) => {
  const { videoTimeline } = useVideoTimeline();
  const { audioTimeline } = useAudioTimeline();
  const { playheadTime, timelineClock } = useTimelineClock();

  const videoDuration = videoTimeline.getTotalDuration();
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
