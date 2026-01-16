import type { EffectsState } from '../../features/renderer/effects_store';
import { useRenderLoop } from '../../features/use_render_loop';
import { useVideoPreviewFactory } from '../../features/video_preview_factory/use_video_preview_factory';
import type { VideoPreview } from '../../features/video_preview_factory/video_preview';
import type { RenderLoopTickEvent } from '../../lib/render_loop';
import classes from './preview_base_item.module.css';
import React from 'react';

export const PreviewBaseItem = ({
  videoPath,
  videoTrimmedDuration,
  effectsState,
  headerLeft,
  headerRight,
  footerLeft,
  footerRight,
  controls,
}: {
  videoPath: string;
  videoTrimmedDuration?: number;
  effectsState?: EffectsState;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  controls?: React.ReactNode;
}) => {
  const { subscribeToTick } = useRenderLoop();
  const { videoPreviewFactory } = useVideoPreviewFactory();

  const videoPreviewRef = React.useRef<VideoPreview | undefined>(undefined);

  const canvasContainerRef = React.useRef<HTMLDivElement>(null);

  const load = () => {
    const abortController = new AbortController();
    videoPreviewFactory
      .create(videoPath, {
        trimmedDuration: videoTrimmedDuration,
      })
      .then((videoPreview) => {
        if (abortController.signal.aborted) {
          return;
        }

        const canvas = videoPreview.renderer.canvas;
        canvasContainerRef.current?.appendChild(canvas);
        videoPreviewRef.current = videoPreview;
        videoPreviewRef.current.update({ lastTime: 0, effectsState });
      });

    return () => {
      abortController.abort();
    };
  };

  React.useEffect(() => load(), []);

  const onTick = ({ lastTime }: RenderLoopTickEvent) => {
    if (videoPreviewRef.current?.player.isPlaying) {
      videoPreviewRef.current.update({ lastTime, effectsState });
    }
  };

  React.useEffect(() => subscribeToTick(onTick), []);

  const onCanvasClick = () => {
    videoPreviewRef.current?.togglePlay();
  };

  return (
    <div className={classes.container}>
      <div
        ref={canvasContainerRef}
        className={classes.canvas}
        onClick={onCanvasClick}
      ></div>
      <div className={classes.header}>
        <div>{headerLeft}</div>
        <div>{headerRight}</div>
      </div>
      <div className={classes.footer}>
        <div>{footerLeft}</div>
        <div>{footerRight}</div>
      </div>
      <div className={classes.controls}>{controls}</div>
    </div>
  );
};
