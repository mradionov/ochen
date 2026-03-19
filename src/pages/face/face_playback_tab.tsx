import { useRenderLoop } from '../../features/use_render_loop';
import { FaceCompositor } from './face_compositor';
import { KEY_LANDMARK_INDICES } from './face_landmark_indices';
import { FaceRecordingPlayer } from './face_recording_player';
import { deriveFaceStates, type FaceStates } from './face_states';
import { Button, Group, Progress, SegmentedControl, Slider, Stack, Text } from '@mantine/core';
import React from 'react';

const compositor = new FaceCompositor();

const CANVAS_W = 960;
const CANVAS_H = 540;

function StateBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <Text size="xs" mb={2}>{label}: {value.toFixed(3)}</Text>
      <Progress value={value * 100} size="sm" />
    </div>
  );
}

export const FacePlaybackTab = () => {
  const { subscribeToTick } = useRenderLoop();

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const playerRef = React.useRef<FaceRecordingPlayer | null>(null);
  const isPlayingRef = React.useRef(false);
  const currentTimeRef = React.useRef(0);
  const modeRef = React.useRef<'landmarks' | 'compositor'>('landmarks');

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [states, setStates] = React.useState<FaceStates | null>(null);
  const [mode, setMode] = React.useState<'landmarks' | 'compositor'>('landmarks');

  React.useEffect(
    () =>
      subscribeToTick(({ deltaTime }) => {
        const player = playerRef.current;
        if (!player || !canvasRef.current) return;

        if (isPlayingRef.current) {
          currentTimeRef.current = Math.min(
            currentTimeRef.current + deltaTime,
            player.duration,
          );
          if (currentTimeRef.current >= player.duration) {
            isPlayingRef.current = false;
            setIsPlaying(false);
          }
          setCurrentTime(currentTimeRef.current);
        }

        const landmarks = player.getLandmarksAtTime(currentTimeRef.current);
        if (!landmarks) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const scaleX = CANVAS_W / player.width;
        const scaleY = CANVAS_H / player.height;
        const faceStates = deriveFaceStates(landmarks);

        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        if (modeRef.current === 'compositor') {
          compositor.draw(ctx, landmarks, faceStates, scaleX, scaleY);
        } else {
          ctx.fillStyle = 'lime';
          for (const idx of KEY_LANDMARK_INDICES) {
            const pos = KEY_LANDMARK_INDICES.indexOf(idx);
            const lm = landmarks[pos];
            if (!lm) continue;
            ctx.beginPath();
            ctx.arc(lm[0] * scaleX, lm[1] * scaleY, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        setStates(faceStates);
      }),
    [],
  );

  const onLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = ev.target?.result as string;
      const player = FaceRecordingPlayer.fromJSON(json);
      playerRef.current = player;
      currentTimeRef.current = 0;
      setCurrentTime(0);
      setDuration(player.duration);
      setIsPlaying(false);
      isPlayingRef.current = false;
    };
    reader.readAsText(file);
  };

  const onPlayPause = () => {
    if (!playerRef.current) return;
    const next = !isPlayingRef.current;
    if (next && currentTimeRef.current >= (playerRef.current?.duration ?? 0)) {
      currentTimeRef.current = 0;
    }
    isPlayingRef.current = next;
    setIsPlaying(next);
  };

  const onScrub = (value: number) => {
    currentTimeRef.current = value;
    setCurrentTime(value);
  };

  const onModeChange = (value: string) => {
    const m = value as 'landmarks' | 'compositor';
    modeRef.current = m;
    setMode(m);
  };

  return (
    <Stack>
      <Group>
        <SegmentedControl
          value={mode}
          onChange={onModeChange}
          data={[
            { label: 'Landmarks', value: 'landmarks' },
            { label: 'Compositor', value: 'compositor' },
          ]}
        />
        <Button component="label">
          Load recording
          <input
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={onLoadFile}
          />
        </Button>

        {duration > 0 && (
          <Button onClick={onPlayPause}>
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
        )}

        {duration > 0 && (
          <Text size="sm">
            {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
          </Text>
        )}
      </Group>

      {duration > 0 && (
        <Slider
          min={0}
          max={duration}
          step={0.01}
          value={currentTime}
          onChange={onScrub}
          label={(v) => `${v.toFixed(2)}s`}
        />
      )}

      <Group align="flex-start">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ background: '#111' }}
        />

        {states && (
          <Stack w={180} gap="xs">
            <StateBar label="Mouth open" value={states.mouthOpenness} />
            <StateBar label="Mouth width" value={states.mouthWidth} />
            <StateBar label="Eye L" value={states.eyeOpennessLeft} />
            <StateBar label="Eye R" value={states.eyeOpennessRight} />
            <StateBar label="Brow L" value={states.browRaiseLeft} />
            <StateBar label="Brow R" value={states.browRaiseRight} />
            <Text size="xs">Tilt: {(states.headTilt * (180 / Math.PI)).toFixed(1)}°</Text>
            <Text size="xs">Scale: {states.faceScale.toFixed(0)}px</Text>
          </Stack>
        )}
      </Group>
    </Stack>
  );
};
