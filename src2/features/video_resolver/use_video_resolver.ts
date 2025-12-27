import { VideoResolver } from './video_resolver';

const videoResolver = new VideoResolver();

export const useVideoResolver = () => {
  return { videoResolver };
};
