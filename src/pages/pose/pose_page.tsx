import { useRenderLoop } from '../../features/use_render_loop';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';
import { Button, Group, Slider, Stack, Text } from '@mantine/core';
import React from 'react';

tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${
    tfjsWasm.version_wasm
  }/dist/`,
);

// MoveNet 17 keypoint connections
const SKELETON_EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 4],       // head
  [5, 6],                                 // shoulders
  [5, 7], [7, 9],                        // left arm
  [6, 8], [8, 10],                       // right arm
  [5, 11], [6, 12],                      // torso sides
  [11, 12],                              // hips
  [11, 13], [13, 15],                    // left leg
  [12, 14], [14, 16],                    // right leg
];

const SCORE_THRESHOLD = 0.3;

let detector: poseDetection.PoseDetector | undefined;

const detectorPromise = poseDetection.createDetector(
  poseDetection.SupportedModels.MoveNet,
  {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
  },
).then((d) => {
  detector = d;
  return d;
});

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  keypoints: poseDetection.Keypoint[],
  scaleX: number,
  scaleY: number,
) {
  // Draw edges
  ctx.strokeStyle = 'lime';
  ctx.lineWidth = 2;
  for (const [a, b] of SKELETON_EDGES) {
    const kpA = keypoints[a];
    const kpB = keypoints[b];
    if (
      !kpA || !kpB ||
      (kpA.score ?? 0) < SCORE_THRESHOLD ||
      (kpB.score ?? 0) < SCORE_THRESHOLD
    ) continue;
    ctx.beginPath();
    ctx.moveTo(kpA.x * scaleX, kpA.y * scaleY);
    ctx.lineTo(kpB.x * scaleX, kpB.y * scaleY);
    ctx.stroke();
  }

  // Draw joints
  ctx.fillStyle = 'cyan';
  for (const kp of keypoints) {
    if ((kp.score ?? 0) < SCORE_THRESHOLD) continue;
    ctx.beginPath();
    ctx.arc(kp.x * scaleX, kp.y * scaleY, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const PosePage = () => {
  const { subscribeToTick } = useRenderLoop();

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [videoLoaded, setVideoLoaded] = React.useState(false);
  const [detectorReady, setDetectorReady] = React.useState(false);
  const isSeeking = React.useRef(false);

  React.useEffect(() => {
    detectorPromise.then(() => setDetectorReady(true));
  }, []);

  React.useEffect(
    () =>
      subscribeToTick(async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!detector || !video || !canvas || video.readyState < 2) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const scaleX = canvas.width / video.videoWidth;
        const scaleY = canvas.height / video.videoHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const poses = await detector.estimatePoses(video);
        if (poses.length === 0) return;

        drawSkeleton(ctx, poses[0].keypoints, scaleX, scaleY);

        if (!isSeeking.current) {
          setCurrentTime(video.currentTime);
        }
      }),
    [],
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.playsInline = true;
    video.muted = true;
    video.crossOrigin = 'anonymous';
    video.onloadedmetadata = () => {
      setDuration(video.duration);
      setVideoLoaded(true);
    };
    video.onended = () => setIsPlaying(false);

    if (videoRef.current) {
      videoRef.current.pause();
      URL.revokeObjectURL(videoRef.current.src);
    }
    videoRef.current = video;
    setIsPlaying(false);
    setCurrentTime(0);
    setVideoLoaded(false);
  };

  const onPlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const onSeek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrentTime(value);
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Stack p="md" gap="sm">
      <Group>
        <input
          type="file"
          accept="video/*,.mov"
          onChange={onFileChange}
        />
        {!detectorReady && <Text size="xs" c="dimmed">Loading model...</Text>}
      </Group>

      <canvas ref={canvasRef} width={960} height={540} style={{ display: 'block', background: '#000' }} />

      {videoLoaded && (
        <Stack gap="xs">
          <Group>
            <Button onClick={onPlayPause}>
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Text size="xs" c="dimmed">
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </Group>
          <Slider
            min={0}
            max={duration}
            step={0.033}
            value={currentTime}
            onChange={onSeek}
            onMouseDown={() => { isSeeking.current = true; }}
            onMouseUp={() => { isSeeking.current = false; }}
            style={{ width: 960 }}
          />
        </Stack>
      )}
    </Stack>
  );
};
