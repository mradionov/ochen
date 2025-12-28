import { useVideoTimeline } from '../../../features/video_timeline/use_video_timeline';
import type { VideoTimelineClip } from '../../../features/video_timeline/video_timeline_selectors';
import { VideoClip } from './video_clip';
import classes from './video_track.module.css';

export const VideoTrack = ({
  maxDuration,
  selectedClip,
  onSelect,
}: {
  maxDuration: number;
  selectedClip: VideoTimelineClip | undefined;
  onSelect: (clip: VideoTimelineClip) => void;
}) => {
  const { videoTimeline } = useVideoTimeline();

  const clips = videoTimeline.getTimelineClips();

  return (
    <div className={classes.root}>
      {clips.map((clip) => (
        <VideoClip
          key={clip.videoId}
          timelineClip={clip}
          maxDuration={maxDuration}
          onSelect={onSelect}
          isSelected={selectedClip?.videoId === clip.videoId}
        />
      ))}
    </div>
  );
};
