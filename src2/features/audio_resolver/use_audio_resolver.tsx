import React from 'react';
import { AudioResolver } from './audio_resolver';
import { AudioResolverStore } from './audio_resolver_store';

const audioResolverStore = new AudioResolverStore();
const audioResolver = new AudioResolver(audioResolverStore);

export const useAudioResolver = () => {
  const audioResolverSnap = React.useSyncExternalStore(
    audioResolverStore.subscribe,
    audioResolverStore.getSnapshot,
  );

  return { audioResolver, audioResolverSnap };
};
