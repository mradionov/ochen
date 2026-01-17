import { manifestStore } from '../manifest/install';
import { useManifest } from '../manifest/use_manifest';
import { videoResolverStore } from '../video_resolver/install';
import { useVideoResolver } from '../video_resolver/use_video_resolver';
import { VideoTimelineStore } from './video_timeline_store';
import React from 'react';

const videoTimelineStore = new VideoTimelineStore(
  manifestStore,
  videoResolverStore,
);

export const useVideoTimeline = () => {
  const { manifestState } = useManifest();
  const { videoResolver } = useVideoResolver();

  const videoTimelineSnap = React.useSyncExternalStore(
    videoTimelineStore.subscribe,
    videoTimelineStore.getSnapshot,
  );

  React.useEffect(() => {
    void videoResolver.loadMetadata(manifestState.videoTrack.clips);
  }, [manifestState, videoResolver]);

  return { videoTimelineSnap };
};
