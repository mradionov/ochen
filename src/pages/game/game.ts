import { AudioAnalyser } from '../../features/audio_processing/audio_analyser';
import { AudioCapture } from '../../features/audio_processing/audio_capture';
import { RenderLoop } from '../../lib/render_loop';
import { IH, IW } from './config';

export const createGame = async () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = IW;
  canvas.height = IH;

  const loop = new RenderLoop();
  const audioCapture = new AudioCapture();
  const audioAnalyer = new AudioAnalyser();

  loop.tick.addListener(() => {
    const audioCaptureData = audioCapture.update();
    const audioInfo = audioAnalyer.process(audioCaptureData);

    // console.log('tick', audioInfo);
  });

  await audioCapture.connectStream();

  loop.start();
  audioCapture.start();

  return { canvas };
};
