import React from 'react';
import type { EffectsStore } from '../../features/renderer/stores/effects_store';
import classes from './preview_base_item.module.css';
import { useVideoPreviewFactory } from '../../features/video_preview_factory/use_video_preview_factory';
import type { VideoPreview } from '../../features/video_preview_factory/video_preview';
import { useRenderLoop } from '../../features/use_render_loop';

export const PreviewBaseItem = ({
  videoPath,
  videoTrimmedDuration,
  headerLeft,
  headerRight,
  footerLeft,
  footerRight,
  controls,
}: {
  videoPath: string;
  videoTrimmedDuration?: number;
  effects?: EffectsStore;
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
      });

    return () => {
      abortController.abort();
    };
  };

  React.useEffect(() => load(), []);

  const onTick = () => {
    if (videoPreviewRef.current?.player.isPlaying) {
      videoPreviewRef.current.update({ effectsStore: undefined });
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
      <div>{controls}</div>
    </div>
  );
};
