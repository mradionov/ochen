import { VideoPreviewFactory } from './video_preview_factory';

const videoPreviewFactory = new VideoPreviewFactory();

export const useVideoPreviewFactory = () => {
  return { videoPreviewFactory };
};
