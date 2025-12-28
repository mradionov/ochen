import { Button, Group, Stack } from '@mantine/core';
import { ManifestSaveButton } from '../../features/manifest/manifest_save_button';
import { toClockString, toMinutesString } from '../../lib/time_utils';
import { useVideoTimeline } from '../../features/video_timeline/use_video_timeline';
import { useAudioTimeline } from '../../features/audio_timeline/use_audio_timeline';
import React from 'react';
import { VideoTrack } from './video_track/video_track';
import { AudioTrack } from './audio_track/audio_track';
import { PlayheadTrack } from './playhead_track/playhead_track';
import { RunningClock } from '../../lib/running_clock';
import { useRenderLoop } from '../../features/use_render_loop';

const timelineClock = new RunningClock();

export const TimelinePage = () => {
  const { subscribeToTick } = useRenderLoop();

  const { videoTimeline } = useVideoTimeline();
  const { audioTimeline } = useAudioTimeline();

  const videoDuration = videoTimeline.getTotalDuration();
  const audioDuration = audioTimeline.getTotalDuration();
  const maxDuration = Math.max(videoDuration, audioDuration);

  const [playheadTime, setPlayheadTime] = React.useState(0);

  React.useEffect(() => {
    const unsub = timelineClock.timeUpdate.addListener(({ time }) => {
      setPlayheadTime(time);
    });
    return () => {
      unsub();
    };
  }, []);

  React.useEffect(
    () =>
      subscribeToTick(({ deltaTime }) => {
        timelineClock.update({ deltaTime });
      }),
    [],
  );

  const onPlay = () => {
    timelineClock.play();
  };

  const onPause = () => {
    timelineClock.pause();
  };

  const onPlayheadSeek = (newTime: number) => {
    timelineClock.seek(newTime);
  };

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
      <div>
        <PlayheadTrack
          time={playheadTime}
          maxDuration={maxDuration}
          onSeek={onPlayheadSeek}
        />
        <VideoTrack
          maxDuration={maxDuration}
          selectedClip={undefined}
          onSelect={() => {}}
        />
        <AudioTrack
          maxDuration={maxDuration}
          selectedClip={undefined}
          onSelect={() => {}}
        />
      </div>
    </Stack>
  );
};
