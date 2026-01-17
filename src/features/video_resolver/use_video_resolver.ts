import { videoResolver, videoResolverStore } from './install';
import React from 'react';

export const useVideoResolver = () => {
  const videoResolverSnap = React.useSyncExternalStore(
    videoResolverStore.subscribe,
    videoResolverStore.getSnapshot,
  );

  return { videoResolver, videoResolverSnap };
};
