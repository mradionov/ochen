import type { EffectsState } from '../effects/effects_store';
import { useRenderLoop } from '../use_render_loop';
import type { RenderFrame } from './render_frame';
import { Renderer } from './renderer';
import React from 'react';

export const RendererSurface = ({
  width,
  height,
  frameProvider,
  effectsState,
  onClick,
}: {
  width: number;
  height: number;
  frameProvider: () => RenderFrame | null;
  effectsState?: EffectsState;
  onClick?: () => void;
}) => {
  const { subscribeToTick } = useRenderLoop();

  const rendererRef = React.useRef<Renderer | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

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
          lastTime,
          offset: frame.offset,
          effectsState,
        });
      }),
    [frameProvider, effectsState, subscribeToTick],
  );

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={onClick}
    ></canvas>
  );
};
