import { useVideoTimeline } from '../../../features/video_timeline/use_video_timeline';
import { VideoClip } from '../video_clip/video_clip.tsx';
import classes from './video_track.module.css';

export const VideoTrack = ({ maxDuration }: { maxDuration: number }) => {
  const { videoTimeline } = useVideoTimeline();

  const clips = videoTimeline.getTimelineClips();

  return (
    <div className={classes.root}>
      {clips.map((clip) => (
        <VideoClip
          key={clip.videoId}
          timelineClip={clip}
          maxDuration={maxDuration}
        />
      ))}
    </div>
  );
};
