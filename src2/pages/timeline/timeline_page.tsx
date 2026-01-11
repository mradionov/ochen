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
import { Page } from '../../ui/page/page';
import { RendererSurface } from '../../features/renderer/renderer_surface';
import { VideoProducer } from '../../features/video_producer/video_producer';
import React from 'react';
import type { RenderablePlayer } from '../../features/video_player/renderable_player';
import { type VideoTimelineClip } from '../../features/video_timeline/video_timeline_selectors';
import { useManifest } from '../../features/manifest/use_manifest';
import { AudioProducer } from '../../features/audio_producer/audio_producer';

export const TimelinePage = () => {
  const videoProducerRef = React.useRef<VideoProducer | null>(null);
  const audioProducerRef = React.useRef<AudioProducer | null>(null);

  const [player, setPlayer] = React.useState<RenderablePlayer | null>(null);
  const [currentVideoTimelineClip, setCurrentVideoTimelineClip] =
    React.useState<VideoTimelineClip | null>(null);

  const { manifestState } = useManifest();
  const { playheadTime, timelineClock } = useTimelineClock();
  const { videoTimeline } = useVideoTimeline();
  const { audioTimeline } = useAudioTimeline();

  const videoDuration = videoTimeline.getTotalDuration();
  const audioDuration = audioTimeline.getTotalDuration();
  const maxDuration = Math.max(videoDuration, audioDuration);

  const onPlay = () => {
    timelineClock.play();
    videoProducerRef.current?.play();
    audioProducerRef.current?.play();
  };

  const onPause = () => {
    timelineClock.pause();
    videoProducerRef.current?.pause();
    audioProducerRef.current?.pause();
  };

  const onTogglePlay = () => {
    if (videoProducerRef.current?.isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const onPlayheadSeek = (newTime: number) => {
    videoProducerRef.current?.seek(newTime);
    audioProducerRef.current?.seek(newTime);
    timelineClock.seek(newTime);
  };

  React.useEffect(() => {
    videoProducerRef.current = new VideoProducer(videoTimeline);
    videoProducerRef.current.playerChanged.addListener(
      ({ player, nextPlayer, timelineClip }) => {
        console.log('videoProducer#playerchanged', { player, nextPlayer });
        setPlayer(player);
        setCurrentVideoTimelineClip(timelineClip);
      },
    );
    videoProducerRef.current.load();
  }, [videoTimeline]);

  React.useEffect(() => {
    audioProducerRef.current = new AudioProducer(audioTimeline);
    audioProducerRef.current.playerChanged.addListener(({ player }) => {
      console.log('audioProducer#playerchanged', { player });
    });
    audioProducerRef.current.load();
  }, [audioTimeline]);

  // React.useEffect(() => {
  //   videoProducerRef.current?.reset(playheadTime);
  // }, [videoTimeline]);

  // React.useEffect(() => {
  //   audioProducerRef.current?.reset(playheadTime);
  // }, [audioTimeline]);

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
            <div className={classes.column}>
              {player != null && (
                <RendererSurface
                  player={player}
                  width={500}
                  height={500}
                  onClick={onTogglePlay}
                  effectsState={manifestState.videoTrack.effects}
                  offset={{
                    offsetX: currentVideoTimelineClip?.clip.offsetX,
                    offsetY: currentVideoTimelineClip?.clip.offsetY,
                  }}
                />
              )}
            </div>
            <div className={classes.column}>
              <DetailsView playheadTime={playheadTime} />
            </div>
          </div>
        </Stack>
      </Page.Fixed>
    </EditorStateProvider>
  );
};
