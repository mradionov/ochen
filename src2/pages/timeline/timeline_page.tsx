import { Stack } from '@mantine/core';
import { ManifestSaveButton } from '../../features/manifest/manifest_save_button';
import { toMinutesString } from '../../lib/time_utils';
import { useVideoTimeline } from '../../features/video_timeline/use_video_timeline';
import { useManifest } from '../../features/manifest/use_manifest';
import { useAudioTimeline } from '../../features/audio_timeline/use_audio_timeline';
import { useVideoResolver } from '../../features/video_resolver/use_video_resolver';
import { useAudioResolver } from '../../features/audio_resolver/use_audio_resolver';
import React from 'react';

export const TimelinePage = () => {
  const { manifestState } = useManifest();

  const { videoResolver } = useVideoResolver();
  const { audioResolver } = useAudioResolver();

  const { videoTimeline } = useVideoTimeline();
  const { audioTimeline } = useAudioTimeline();

  React.useEffect(() => {
    void videoResolver.loadMetadata(manifestState.videoTrack.clips);
    void audioResolver.loadMetadata(manifestState.audioTrack.clips);
  }, [manifestState, videoResolver, audioResolver]);

  const videoDuration = videoTimeline.getTotalDuration();
  const audioDuration = audioTimeline.getTotalDuration();
  const maxDuration = Math.max(videoDuration, audioDuration);

  return (
    <Stack>
      <ManifestSaveButton />
      <hr />
      Video duration: {toMinutesString(videoDuration)} <br />
      Audio duration: {toMinutesString(audioDuration)} <br />
      Max duration: {toMinutesString(maxDuration)} <br />
      <hr />
    </Stack>
  );
};
