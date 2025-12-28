import { Button, Group, Stack } from '@mantine/core';
import { ManifestSaveButton } from '../../features/manifest/manifest_save_button';
import { toClockString, toMinutesString } from '../../lib/time_utils';
import { useVideoTimeline } from '../../features/video_timeline/use_video_timeline';
import { useAudioTimeline } from '../../features/audio_timeline/use_audio_timeline';
import { Timeline } from './timeline/timeline';
import { useTimelineClock } from './use_timeline_clock';

export const TimelinePage = () => {
  const { playheadTime, timelineClock } = useTimelineClock();
  const { videoTimeline } = useVideoTimeline();
  const { audioTimeline } = useAudioTimeline();

  const videoDuration = videoTimeline.getTotalDuration();
  const audioDuration = audioTimeline.getTotalDuration();
  const maxDuration = Math.max(videoDuration, audioDuration);

  const onPlay = () => {
    timelineClock.play();
  };

  const onPause = () => {
    timelineClock.pause();
  };

  const onPlayheadSeek = (newTime: number) => {};

  return (
    <Stack gap="xs">
      <ManifestSaveButton />
      Video duration: {toMinutesString(videoDuration)} <br />
      Audio duration: {toMinutesString(audioDuration)} <br />
      Max duration: {toMinutesString(maxDuration)} <br />
      <Group>
        <Button onClick={onPlay}>play</Button>
        <Button onClick={onPause}>pause</Button>
      </Group>
      Time: {toClockString(playheadTime)} / {toClockString(maxDuration)}
      <Timeline onPlayheadSeek={onPlayheadSeek} />
    </Stack>
  );
};
