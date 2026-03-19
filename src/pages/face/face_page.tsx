import { useRenderLoop } from '../../features/use_render_loop';
import { VideoCapture } from '../../features/video_capture/video_capture';
import { FaceLandmarkDetector } from './face_landmark_detector';
import { FacePlaybackTab } from './face_playback_tab';
import { KEY_LANDMARK_INDICES } from './face_landmark_indices';
import {
  createFaceRecording,
  downloadFaceRecording,
  type FaceRecording,
} from './face_recording';
import '@tensorflow-models/face-landmarks-detection';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';
import { Button, Group, Tabs } from '@mantine/core';
import React from 'react';

tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${
    tfjsWasm.version_wasm
  }/dist/`,
);

const videoCapture = new VideoCapture();
const detectorPromise = FaceLandmarkDetector.createDetector();

let detector: Awaited<ReturnType<typeof FaceLandmarkDetector.createDetector>> | undefined;

const FaceRecordTab = () => {
  const { subscribeToTick } = useRenderLoop();

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const activeRecordingRef = React.useRef<FaceRecording | null>(null);
  const completedRecordingRef = React.useRef<FaceRecording | null>(null);
  const recordingStartRef = React.useRef<number>(0);
  const [isRecording, setIsRecording] = React.useState(false);
  const [frameCount, setFrameCount] = React.useState(0);

  React.useEffect(() => {
    const create = async () => {
      await videoCapture.connect();
      detector = await detectorPromise;
    };
    create();
  }, []);

  React.useEffect(
    () =>
      subscribeToTick(async ({ lastTime }) => {
        const video = videoCapture.update().video;
        if (!detector || !canvasRef.current) return;

        const faces = await detector.estimateFaces(video, {
          flipHorizontal: false,
        });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const scaleX = canvas.width / video.videoWidth;
        const scaleY = canvas.height / video.videoHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (faces.length === 0) return;

        const face = faces[0];
        const keypoints = face.keypoints;

        ctx.fillStyle = 'lime';
        for (const idx of KEY_LANDMARK_INDICES) {
          const kp = keypoints[idx];
          if (!kp) continue;
          ctx.beginPath();
          ctx.arc(kp.x * scaleX, kp.y * scaleY, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        if (activeRecordingRef.current) {
          const t = lastTime - recordingStartRef.current;
          const landmarks = KEY_LANDMARK_INDICES.map((idx) => {
            const kp = keypoints[idx];
            return [kp?.x ?? 0, kp?.y ?? 0, kp?.z ?? 0] as [number, number, number];
          });
          activeRecordingRef.current.frames.push({ t, landmarks });
          setFrameCount((n) => n + 1);
        }
      }),
    [],
  );

  const onRecord = () => {
    const video = videoCapture.update().video;
    activeRecordingRef.current = createFaceRecording(video.videoWidth, video.videoHeight);
    completedRecordingRef.current = null;
    recordingStartRef.current = performance.now() / 1000;
    setFrameCount(0);
    setIsRecording(true);
  };

  const onStop = () => {
    completedRecordingRef.current = activeRecordingRef.current;
    activeRecordingRef.current = null;
    setIsRecording(false);
  };

  const onDownload = () => {
    if (!completedRecordingRef.current) return;
    downloadFaceRecording(completedRecordingRef.current);
  };

  return (
    <div>
      <Group mb="sm">
        {!isRecording ? (
          <Button color="red" onClick={onRecord}>Record</Button>
        ) : (
          <Button onClick={onStop}>Stop</Button>
        )}
        {!isRecording && frameCount > 0 && (
          <Button variant="outline" onClick={onDownload}>
            Download ({frameCount} frames)
          </Button>
        )}
      </Group>
      <canvas ref={canvasRef} width={960} height={540} />
    </div>
  );
};

export const FacePage = () => (
  <Tabs defaultValue="record">
    <Tabs.List mb="md">
      <Tabs.Tab value="record">Record</Tabs.Tab>
      <Tabs.Tab value="playback">Playback</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="record">
      <FaceRecordTab />
    </Tabs.Panel>
    <Tabs.Panel value="playback">
      <FacePlaybackTab />
    </Tabs.Panel>
  </Tabs>
);
