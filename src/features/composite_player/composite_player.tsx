import { AudioProducer } from '../audio_producer/audio_producer';
import { useAudioTimeline } from '../audio_timeline/use_audio_timeline';
import { useManifest } from '../manifest/use_manifest';
import { RendererSurface } from '../renderer/renderer_surface';
import { useTimelineClock } from '../timeline_clock/use_timeline_clock';
import { useVideoProducer } from '../video_producer/use_video_producer';
import { VideoProducer } from '../video_producer/video_producer';
import { useVideoTimeline } from '../video_timeline/use_video_timeline';
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
  // const videoProducerRef = React.useRef<VideoProducer | null>(null);
  const audioProducerRef = React.useRef<AudioProducer | null>(null);

  const { manifestState } = useManifest();
  // const { videoTimelineSnap } = useVideoTimeline();
  const { audioTimeline } = useAudioTimeline();

  const { videoProducer, frameProvider } = useVideoProducer();

  // React.useEffect(() => {
  //   videoProducerRef.current = new VideoProducer(videoTimelineSnap);
  //   videoProducerRef.current.load();
  // }, [videoTimelineSnap]);

  React.useEffect(() => {
    audioProducerRef.current = new AudioProducer(audioTimeline);
    audioProducerRef.current.playerChanged.addListener(({ player }) => {
      console.log('audioProducer#playerchanged', { player });
    });
    audioProducerRef.current.load();
  }, [audioTimeline]);

  React.useEffect(() => {
    return controllerRef?.current.seeked.addListener((newTime: number) => {
      // videoProducerRef.current?.seek(newTime);
      audioProducerRef.current?.seek(newTime);
    });
  }, [controllerRef]);

  React.useEffect(() => {
    return controllerRef?.current.played.addListener(() => {
      // videoProducerRef.current?.play();
      audioProducerRef.current?.play();
    });
  }, [controllerRef]);

  React.useEffect(() => {
    return controllerRef?.current.paused.addListener(() => {
      // videoProducerRef.current?.pause();
      audioProducerRef.current?.pause();
    });
  }, [controllerRef]);

  React.useEffect(() => {
    return controllerRef?.current.toggledPlay.addListener(() => {
      // if (videoProducerRef.current?.isPlaying) {
      // videoProducerRef.current.pause();
      // audioProducerRef.current?.pause();
      // } else {
      // videoProducerRef.current?.play();
      // audioProducerRef.current?.play();
      // }
    });
  }, [controllerRef]);

  return (
    <RendererSurface
      frameProvider={frameProvider}
      width={width}
      height={height}
      onClick={onSurfaceClick}
      effectsState={manifestState.videoTrack.effects}
    />
  );
};
