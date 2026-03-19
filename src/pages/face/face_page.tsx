import { useRenderLoop } from '../../features/use_render_loop';
import { VideoCapture } from '../../features/video_capture/video_capture';
import { FaceDetector } from './face_detector';
import '@tensorflow-models/face-detection';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';
import React from 'react';

tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${
    tfjsWasm.version_wasm
  }/dist/`,
);

const videoCapture = new VideoCapture();
const detectorPromise = FaceDetector.createDetector();

let detector;

export const FacePage = () => {
  const { subscribeToTick } = useRenderLoop();

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const create = async () => {
      await videoCapture.connect();
      detector = await detectorPromise;
    };
    create();
  }, []);

  React.useEffect(
    () =>
      subscribeToTick(async () => {
        const video = videoCapture.update().video;
        if (!detector || !canvasRef.current) {
          return;
        }

        const faces = await detector.estimateFaces(video, {
          flipHorizontal: false,
        });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const scaleX = canvas.width / video.videoWidth;
        const scaleY = canvas.height / video.videoHeight;

        faces.forEach((face) => {
          const box = face.box;
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 4;
          ctx.strokeRect(
            box.xMin * scaleX,
            box.yMin * scaleY,
            box.width * scaleX,
            box.height * scaleY,
          );
        });
      }),
    [],
  );

  return (
    <div>
      <canvas ref={canvasRef} width={500} height={500}></canvas>
    </div>
  );
};
