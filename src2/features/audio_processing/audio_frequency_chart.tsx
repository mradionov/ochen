import React from 'react';
import { useRenderLoop } from '../use_render_loop';
import type { AudioCaptureData } from './audio_capture';
import { audioAnalyserBandsConfig } from './audio_analyser';

const config = audioAnalyserBandsConfig;

const colors = [
  '#FF0000',
  // '#FF5E00',
  // '#FFBB00',
  // '#D4FF00',
  '#76FF00',
  '#19FF00',
  '#00FF38',
  '#00FF95',
  '#00F9FF',
  '#009CFF',
  '#003FFF',
  '#1A00FF',
  '#7700FF',
  '#D400FF',
  '#FF00C2',
];

export const AudioFrequencyChart = ({
  audioCaptureData,
}: {
  audioCaptureData?: AudioCaptureData;
}) => {
  const { subscribeToTick } = useRenderLoop();

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(
    () =>
      subscribeToTick(() => {
        if (audioCaptureData == null || canvasRef.current == null) {
          return;
        }

        const { data, sampleRate } = audioCaptureData;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        //   const barWidth = (canvas.width / data.length) * 10;
        let x = 0;
        for (let i = 0; i < data.length; i++) {
          const v = data[i];
          const y = (v / 255) * canvas.height;

          Object.keys(config).forEach((key, index) => {
            const bandLow = (config[key][0] / sampleRate) * data.length;
            const bandHigh = (config[key][1] / sampleRate) * data.length;

            if (i > bandLow && i < bandHigh) {
              ctx.fillStyle = colors[index];
            }
          });

          ctx.fillRect(x, canvas.height - y, 1, y);
          x += 1;
        }
      }),
    [audioCaptureData],
  );

  return <canvas width={500} height={500} ref={canvasRef}></canvas>;
};
