import { useVideoResolver } from '../video_resolver/use_video_resolver';
import { VideoTimeline } from './video_timeline';

export const useVideoTimeline = () => {
  const { videoResolver } = useVideoResolver();

  const videoTimeline = new VideoTimeline(videoResolver);

  return { videoTimeline };
};
