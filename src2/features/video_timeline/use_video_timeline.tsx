import React from 'react';
import { useManifest } from '../manifest/use_manifest';
import { useVideoResolver } from '../video_resolver/use_video_resolver';
import { VideoTimelineSelectors } from './video_timeline_selectors';

export const useVideoTimeline = () => {
  const { manifestState } = useManifest();
  const { videoResolverSnap } = useVideoResolver();

  const videoTimeline = React.useMemo(() => {
    return new VideoTimelineSelectors(manifestState, videoResolverSnap);
  }, [manifestState, videoResolverSnap]);

  return { videoTimeline };
};
