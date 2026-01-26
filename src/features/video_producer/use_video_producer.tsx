import { timelineClock } from '../timeline_clock/install';
import { useVideoTimeline } from '../video_timeline/use_video_timeline';
import { VideoProducer } from './video_producer';
import React from 'react';

const videoProducer = new VideoProducer(timelineClock);

export const useVideoProducer = () => {
  const { videoTimelineSnap } = useVideoTimeline();

  React.useEffect(() => {
    videoProducer.updateTimeline(videoTimelineSnap);
  }, [videoTimelineSnap]);

  const frameProvider = () => {
    return videoProducer.getFrame();
  };

  return { videoProducer, frameProvider };
};
