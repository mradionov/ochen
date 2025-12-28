import { Stack } from '@mantine/core';
import { ManifestSaveButton } from '../../features/manifest/manifest_save_button';
import { toMinutesString } from '../../lib/time_utils';
import { useVideoTimeline } from '../../features/video_timeline/use_video_timeline';
import { useAudioTimeline } from '../../features/audio_timeline/use_audio_timeline';

export const TimelinePage = () => {
  const { videoTimeline } = useVideoTimeline();
  const { audioTimeline } = useAudioTimeline();

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
