import { AudioProducer } from '../audio_producer/audio_producer';
import { useAudioTimeline } from '../audio_timeline/use_audio_timeline';
import { useManifest } from '../manifest/use_manifest';
import { RendererSurface } from '../renderer/renderer_surface';
import type { RenderablePlayer } from '../video_player/renderable_player';
import { VideoProducer } from '../video_producer/video_producer';
import { useVideoTimeline } from '../video_timeline/use_video_timeline';
import type { VideoTimelineClip } from '../video_timeline/video_timeline_selectors';
import type { CompositePlayerController } from './composite_player_controller';
import React from 'react';

export const CompositePlayer = ({
  controllerRef,
  width = 500,
  height = 500,
  onSurfaceClick,
}: {
  width?: number;
  height?: number;
  controllerRef?: React.RefObject<CompositePlayerController>;
  onSurfaceClick?: () => void;
}) => {
  const videoProducerRef = React.useRef<VideoProducer | null>(null);
  const audioProducerRef = React.useRef<AudioProducer | null>(null);

  const { manifestState } = useManifest();
  const { videoTimelineSnap } = useVideoTimeline();
  const { audioTimeline } = useAudioTimeline();

  const [player, setPlayer] = React.useState<RenderablePlayer | null>(null);
  const [currentVideoTimelineClip, setCurrentVideoTimelineClip] =
    React.useState<VideoTimelineClip | null>(null);

  React.useEffect(() => {
    console.log('setup VideoProducer', videoTimelineSnap);

    videoProducerRef.current = new VideoProducer(videoTimelineSnap);
    videoProducerRef.current.playerChanged.addListener(
      ({ player, nextPlayer, timelineClip }) => {
        console.log('videoProducer#playerchanged', { player, nextPlayer });
        setPlayer(player);
        setCurrentVideoTimelineClip(timelineClip);
      },
    );
    videoProducerRef.current.load();
  }, [videoTimelineSnap]);

  React.useEffect(() => {
    console.log('setup AudioProducer');

    audioProducerRef.current = new AudioProducer(audioTimeline);
    audioProducerRef.current.playerChanged.addListener(({ player }) => {
      console.log('audioProducer#playerchanged', { player });
    });
    audioProducerRef.current.load();
  }, [audioTimeline]);

  React.useEffect(() => {
    console.log('setup seeked listener');

    return controllerRef?.current.seeked.addListener((newTime: number) => {
      videoProducerRef.current?.seek(newTime);
      audioProducerRef.current?.seek(newTime);
    });
  }, [controllerRef]);

  React.useEffect(() => {
    console.log('setup played listener');

    return controllerRef?.current.played.addListener(() => {
      videoProducerRef.current?.play();
      audioProducerRef.current?.play();
    });
  }, [controllerRef]);

  React.useEffect(() => {
    console.log('setup paused listener');
    return controllerRef?.current.paused.addListener(() => {
      videoProducerRef.current?.pause();
      audioProducerRef.current?.pause();
    });
  }, [controllerRef]);

  React.useEffect(() => {
    console.log('setup togglePlay listener');
    return controllerRef?.current.toggledPlay.addListener(() => {
      if (videoProducerRef.current?.isPlaying) {
        videoProducerRef.current.pause();
        audioProducerRef.current?.pause();
      } else {
        videoProducerRef.current?.play();
        audioProducerRef.current?.play();
      }
    });
  }, [controllerRef]);

  if (!player) {
    return;
  }

  return (
    <RendererSurface
      player={player}
      width={width}
      height={height}
      onClick={onSurfaceClick}
      effectsState={manifestState.videoTrack.effects}
      offset={{
        offsetX: currentVideoTimelineClip?.clip.offsetX,
        offsetY: currentVideoTimelineClip?.clip.offsetY,
      }}
    />
  );
};
