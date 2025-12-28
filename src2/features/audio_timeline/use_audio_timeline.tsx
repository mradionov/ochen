import React from 'react';
import { useAudioResolver } from '../audio_resolver/use_audio_resolver';
import { useManifest } from '../manifest/use_manifest';
import { AudioTimelineSelectors } from './audio_timeline_selectors';

export const useAudioTimeline = () => {
  const { manifestState } = useManifest();
  const { audioResolverSnap } = useAudioResolver();

  const audioTimeline = React.useMemo(() => {
    return new AudioTimelineSelectors(manifestState, audioResolverSnap);
  }, [manifestState, audioResolverSnap]);

  return { audioTimeline };
};
