import React from 'react';
import { VideoResolver } from './video_resolver';
import { VideoResolverStore } from './video_resolver_store';

const videoResolverStore = new VideoResolverStore();
const videoResolver = new VideoResolver(videoResolverStore);

export const useVideoResolver = () => {
  const videoResolverSnap = React.useSyncExternalStore(
    videoResolverStore.subscribe,
    videoResolverStore.getSnapshot,
  );

  return { videoResolver, videoResolverSnap };
};
