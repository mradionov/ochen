import { Button, Divider, Group, Stack } from '@mantine/core';
import { ManifestSaveButton } from '../../features/manifest/manifest_save_button';
import { toClockString, toMinutesString } from '../../lib/time_utils';
import { useVideoTimeline } from '../../features/video_timeline/use_video_timeline';
import { useAudioTimeline } from '../../features/audio_timeline/use_audio_timeline';
import { Timeline } from './timeline/timeline';
import { useTimelineClock } from './use_timeline_clock';
import { EditorStateProvider } from './editor_state_provider';
import { DetailsView } from './details_view/details_view';

import classes from './timeline_page.module.css';

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
    <EditorStateProvider>
      <Stack gap="xs" style={{ flex: 1, minHeight: 0 }}>
        <ManifestSaveButton />
        <Group>
          Video: {toMinutesString(videoDuration)}
          <Divider orientation="vertical" />
          Audio: {toMinutesString(audioDuration)}
          <Divider orientation="vertical" />
          Max: {toMinutesString(maxDuration)}
        </Group>
        <Group>
          <Button onClick={onPlay}>play</Button>
          <Button onClick={onPause}>pause</Button>
        </Group>
        Time: {toClockString(playheadTime)} / {toClockString(maxDuration)}
        <Timeline onPlayheadSeek={onPlayheadSeek} />
        <div className={classes.content}>
          <div className={classes.column}></div>
          <div className={classes.column}>
            <DetailsView />
          </div>
        </div>
      </Stack>
    </EditorStateProvider>
  );
};
