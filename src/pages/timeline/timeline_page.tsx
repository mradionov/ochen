import { useAudioTimeline } from '../../features/audio_timeline/use_audio_timeline';
import { CompositePlayer } from '../../features/composite_player/composite_player';
import { CompositePlayerController } from '../../features/composite_player/composite_player_controller';
import { ManifestSaveButton } from '../../features/manifest/manifest_save_button';
import { useTimelineClock } from '../../features/timeline_clock/use_timeline_clock';
import { useVideoTimeline } from '../../features/video_timeline/use_video_timeline';
import { toClockString, toMinutesString } from '../../lib/time_utils';
import { Page } from '../../ui/page/page';
import { DetailsView } from './details_view/details_view';
import { EditorStateProvider } from './editor_state_provider';
import { Timeline } from './timeline/timeline';
import classes from './timeline_page.module.css';
import { Button, Divider, Group, Stack } from '@mantine/core';
import React from 'react';

export const TimelinePage = () => {
  const compositeControllerRef = React.useRef<CompositePlayerController>(
    new CompositePlayerController(),
  );

  const { playheadTime, timelineClock } = useTimelineClock();
  const { videoTimelineSnap } = useVideoTimeline();
  const { audioTimeline } = useAudioTimeline();

  const videoDuration = videoTimelineSnap.getTotalDuration();
  const audioDuration = audioTimeline.getTotalDuration();
  const maxDuration = Math.max(videoDuration, audioDuration);

  const onPlay = () => {
    timelineClock.play();
    compositeControllerRef.current.play();
  };

  const onPause = () => {
    timelineClock.pause();
    compositeControllerRef.current.pause();
  };

  const onTogglePlay = () => {
    compositeControllerRef.current.togglePlay();
  };

  const onPlayheadSeek = (newTime: number) => {
    compositeControllerRef.current.seek(newTime);
    timelineClock.seek(newTime);
  };

  return (
    <EditorStateProvider>
      <Page.Fixed>
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
            <div className={classes.videoColumn}>
              <CompositePlayer
                controllerRef={compositeControllerRef}
                width={500}
                height={500}
                onSurfaceClick={onTogglePlay}
              />
            </div>
            <div className={classes.detailsColumn}>
              <DetailsView playheadTime={playheadTime} />
            </div>
          </div>
        </Stack>
      </Page.Fixed>
    </EditorStateProvider>
  );
};
