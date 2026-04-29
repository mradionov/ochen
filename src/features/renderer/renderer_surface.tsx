import type { EffectsState } from '../effects/effects_store';
import { useRenderLoop } from '../use_render_loop';
import type { RenderFrame } from './render_frame';
import { Renderer } from './renderer';
import React from 'react';

export const RendererSurface = ({
  width,
  height,
  frameProvider,
  getEffectsState,
  onClick,
  style,
}: {
  width: number;
  height: number;
  frameProvider: () => RenderFrame | null;
  getEffectsState?: () => EffectsState | undefined;
  onClick?: () => void;
  style?: React.CSSProperties;
}) => {
  const { subscribeToTick } = useRenderLoop();

  const rendererRef = React.useRef<Renderer | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const getEffectsStateRef = React.useRef(getEffectsState);
  getEffectsStateRef.current = getEffectsState;

  React.useEffect(() => {
    if (canvasRef.current == null) {
      return;
    }
    rendererRef.current = Renderer.createFromCanvas(canvasRef.current);
  }, []);

  React.useEffect(
    () =>
      subscribeToTick(({ lastTime }) => {
        const frame = frameProvider();
        if (!frame) {
          return;
        }

        rendererRef.current?.updateFrame({
          renderSource: frame.renderSource,
          fit: frame.fit,
          lastTime,
          offset: frame.offset,
          effectsState: getEffectsStateRef.current?.(),
        });
      }),
    [frameProvider, subscribeToTick],
  );

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={onClick}
      style={{ display: 'block', ...style }}
    ></canvas>
  );
};
