import type { RenderSource } from '../../features/renderer/render_source';
import React from 'react';

export const Crop = ({
  width,
  height,
  renderSource,
}: {
  width: number;
  height: number;
  renderSource: RenderSource;
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  return <canvas ref={canvasRef} width={width} height={height}></canvas>;
};
