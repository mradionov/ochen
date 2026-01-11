import React from 'react';
import { VideoProducer } from '../video_producer/video_producer';
import { AudioProducer } from '../audio_producer/audio_producer';
import type { RenderablePlayer } from '../video_player/renderable_player';
import type { VideoTimelineClip } from '../video_timeline/video_timeline_selectors';
import { useManifest } from '../manifest/use_manifest';
import { useVideoTimeline } from '../video_timeline/use_video_timeline';
import { useAudioTimeline } from '../audio_timeline/use_audio_timeline';
import { RendererSurface } from '../renderer/renderer_surface';
import type { CompositePlayerController } from './composite_player_controller';

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
  const { videoTimeline } = useVideoTimeline();
  const { audioTimeline } = useAudioTimeline();

  const [player, setPlayer] = React.useState<RenderablePlayer | null>(null);
  const [currentVideoTimelineClip, setCurrentVideoTimelineClip] =
    React.useState<VideoTimelineClip | null>(null);

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

  React.useEffect(() => {
    return controllerRef?.current.seeked.addListener((newTime: number) => {
      videoProducerRef.current?.seek(newTime);
      audioProducerRef.current?.seek(newTime);
    });
  }, [controllerRef]);

  React.useEffect(() => {
    return controllerRef?.current.played.addListener(() => {
      videoProducerRef.current?.play();
      audioProducerRef.current?.play();
    });
  }, [controllerRef]);

  React.useEffect(() => {
    return controllerRef?.current.paused.addListener(() => {
      videoProducerRef.current?.pause();
      audioProducerRef.current?.pause();
    });
  }, [controllerRef]);

  React.useEffect(() => {
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
