import React from 'react';
import { Renderer } from './renderer';
import { useRenderLoop } from '../use_render_loop';
import type { RenderablePlayer } from '../video/renderable_player';
import type { EffectsState } from './effects_store';

export const RendererSurface = ({
  width,
  height,
  player,
  offset,
  effectsState,
  onClick,
}: {
  width: number;
  height: number;
  player: RenderablePlayer;
  offset?: {
    offsetX: number | string | undefined;
    offsetY: number | string | undefined;
  };
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
        player.updateFrame();

        const renderSource = player.createRenderSource();

        rendererRef.current?.updateFrame({
          renderSource,
          lastTime,
          offset,
          effectsState,
        });
      }),
    [rendererRef.current, player, offset, effectsState],
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
