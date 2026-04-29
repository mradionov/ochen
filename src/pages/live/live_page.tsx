import {
  DEFAULT_LERP_STATE,
  LERP_SPEED,
  lerpStateToEffects,
  lerpToward,
  type LerpState,
} from './live_shared';
import { VideoRenderSource } from '../../features/renderer/render_source';
import { RendererSurface } from '../../features/renderer/renderer_surface';
import { useRenderLoop } from '../../features/use_render_loop';
import { VideoCapture } from '../../features/video_capture/video_capture';
import { startFaceDetectionLoop, isFaceDetectorAvailable } from '../../features/face_detection/face_detection_runner';
import { faceDetectionStore } from '../../features/face_detection/face_detection_store';
import { Button, Group } from '@mantine/core';
import React from 'react';

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 270;
const DISPLAY_WIDTH = 960;
const DISPLAY_HEIGHT = 540;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomIntBetween(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1));
}

const videoCapture = new VideoCapture();

const lerpState: LerpState = { ...DEFAULT_LERP_STATE };
const targetState: LerpState = { ...DEFAULT_LERP_STATE };

const MIN_ACTIVE_EFFECTS = 2;
const MAX_ACTIVE_EFFECTS = 5;

type EffectKey = 'edge' | 'grain' | 'pixelate' | 'glitch' | 'duotone' | 'chromatic' | 'scanlines' | 'mirror' | 'posterize' | 'tile' | 'ghost' | 'halftone' | 'ascii' | 'dither' | 'ripple' | 'faceOverlay';

// DVD is excluded from the random pool — managed by its own state machine
const ALL_EFFECTS: EffectKey[] = ['edge', 'grain', 'pixelate', 'glitch', 'duotone', 'chromatic', 'scanlines', 'mirror', 'posterize', 'tile', 'ghost', 'halftone', 'ascii', 'dither', 'ripple', 'faceOverlay'];

// Lower weight = picked less often
const EFFECT_WEIGHTS: Record<EffectKey, number> = {
  edge:        1,
  grain:       0.3,
  pixelate:    1,
  glitch:      1,
  duotone:     1,
  chromatic:   1,
  scanlines:   0.3,
  mirror:      1,
  posterize:   1,
  tile:        1,
  ghost:       1,
  halftone:    1,
  ascii:       1,
  dither:      1,
  ripple:      1,
  faceOverlay: 1,
};

const weightKey: Record<EffectKey, keyof LerpState> = {
  edge:        'edgeWeight',
  grain:       'grainWeight',
  pixelate:    'pixelateWeight',
  glitch:      'glitchWeight',
  duotone:     'duotoneWeight',
  chromatic:   'chromaticWeight',
  scanlines:   'scanlinesWeight',
  mirror:      'mirrorWeight',
  posterize:   'posterizeWeight',
  tile:        'tileWeight',
  ghost:       'ghostWeight',
  halftone:    'halftoneWeight',
  ascii:       'asciiWeight',
  dither:      'ditherWeight',
  ripple:      'rippleWeight',
  faceOverlay: 'faceOverlayWeight',
};

let activeEffects: EffectKey[] = [];

// ── DVD state machine ────────────────────────────────────────────────────────
const DVD_FALLBACK_URL = `${import.meta.env.BASE_URL}alina/alina1.png`;
const DVD_FACE_DELAY_MS  =  5_000; // wait after face detected before showing
const DVD_SHOW_MS        =  30_000; // how long DVD stays on screen
const DVD_COOLDOWN_MS    = 120_000; // gap before face can trigger DVD again
const NO_FACE_RANDOM_MIN = 60_000; // random DVD fires after this long without a face
const NO_FACE_RANDOM_MAX = 90_000;

type DvdPhase =
  | { name: 'idle' }
  | { name: 'face-pending'; since: number }
  | { name: 'showing'; since: number; imageUrl: string }
  | { name: 'cooldown'; since: number };

let dvdPhase: DvdPhase = { name: 'idle' };
let dvdCurrentImageUrl: string = DVD_FALLBACK_URL;
let nextRandomDvdAt: number = Date.now() + randomBetween(NO_FACE_RANDOM_MIN, NO_FACE_RANDOM_MAX);

function dvdShow(imageUrl: string) {
  dvdCurrentImageUrl = imageUrl;
  dvdPhase = { name: 'showing', since: Date.now(), imageUrl };
  targetState.dvdWeight = 1;
}

function dvdHide() {
  dvdPhase = { name: 'cooldown', since: Date.now() };
  targetState.dvdWeight = 0;
  nextRandomDvdAt = Date.now() + randomBetween(NO_FACE_RANDOM_MIN, NO_FACE_RANDOM_MAX);
}

function updateDvdStateMachine() {
  const now = Date.now();
  const hasFace = faceDetectionStore.faces.length > 0;
  const noFaceLongTime = now - faceDetectionStore.lastFaceSeenAt > NO_FACE_RANDOM_MIN;

  switch (dvdPhase.name) {
    case 'idle':
      if (hasFace) {
        dvdPhase = { name: 'face-pending', since: now };
      } else if (noFaceLongTime && now >= nextRandomDvdAt) {
        dvdShow(DVD_FALLBACK_URL);
      }
      break;

    case 'face-pending':
      if (!hasFace) {
        dvdPhase = { name: 'idle' };
      } else if (now - dvdPhase.since >= DVD_FACE_DELAY_MS) {
        dvdShow(faceDetectionStore.capturedFaceUrl ?? DVD_FALLBACK_URL);
      }
      break;

    case 'showing':
      if (now - dvdPhase.since >= DVD_SHOW_MS) {
        dvdHide();
      }
      break;

    case 'cooldown':
      if (now - dvdPhase.since >= DVD_COOLDOWN_MS) {
        dvdPhase = { name: 'idle' };
      }
      break;
  }
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Weighted shuffle: higher weight → more likely to appear near the front
// Uses Efraimidis-Spirakis: score = rand^(1/weight), sort descending
function weightedShuffle(arr: EffectKey[]): EffectKey[] {
  return [...arr]
    .map(e => ({ e, score: Math.random() ** (1 / EFFECT_WEIGHTS[e]) }))
    .sort((a, b) => b.score - a.score)
    .map(x => x.e);
}

function randomiseParams() {
  targetState.sat = randomIntBetween(60, 100);
  targetState.lig = randomIntBetween(42, 58);
  targetState.edgeThreshold = randomIntBetween(80, 200);
  targetState.edgeTransparency = randomIntBetween(0, 120);
  targetState.edgeStrength = randomBetween(0.3, 1.2);
  targetState.grainIntensity = randomIntBetween(20, 200);
  targetState.pixelateBlockSize = randomIntBetween(8, 14);
  targetState.glitchIntensity = randomIntBetween(5, 30);
  targetState.glitchSlices = randomIntBetween(6, 20);
  targetState.chromaticOffset = randomIntBetween(4, 20);
  targetState.scanlinesGap = randomIntBetween(3, 8);
  targetState.scanlinesOpacity = randomBetween(0.2, 0.7);
  targetState.posterizeLevels = randomIntBetween(4, 8);
  const tileGrid = [2, 2, 2, 4][randomIntBetween(0, 3)];
  targetState.tileCols = tileGrid;
  targetState.tileRows = tileGrid;
  targetState.ghostDecay = randomBetween(0.3, 0.7);
  targetState.halftoneCellSize = randomIntBetween(4, 12);
  targetState.asciiCellSize = randomIntBetween(6, 12);
  targetState.rippleAmplitude = randomIntBetween(4, 16);
  targetState.rippleFrequency = randomBetween(0.02, 0.08);
  targetState.faceOverlayStyle = Math.random() < 0.5 ? 0 : 1;
}

function pickRandomTarget() {
  randomiseParams();

  if (activeEffects.length === 0) {
    // First run: pick a full random set (weighted)
    const count = randomIntBetween(MIN_ACTIVE_EFFECTS, MAX_ACTIVE_EFFECTS);
    activeEffects = weightedShuffle(ALL_EFFECTS).slice(0, count);
  } else {
    // Drop 1–2 effects, add 1–2 from the inactive pool (weighted)
    const dropCount = randomIntBetween(1, Math.min(2, activeEffects.length - MIN_ACTIVE_EFFECTS + 1));
    const inactive = ALL_EFFECTS.filter(e => !activeEffects.includes(e));
    const addCount = randomIntBetween(1, Math.min(2, inactive.length, MAX_ACTIVE_EFFECTS - activeEffects.length + dropCount));

    shuffle(activeEffects);
    activeEffects = activeEffects.slice(dropCount);
    activeEffects.push(...weightedShuffle(inactive).slice(0, addCount));
  }

  // Apply weights
  for (const key of ALL_EFFECTS) {
    (targetState[weightKey[key]] as number) = activeEffects.includes(key) ? 1 : 0;
  }
}

export const LivePage = () => {
  const { subscribeToTick } = useRenderLoop();
  const [ready, setReady] = React.useState(false);
  const [paused, setPaused] = React.useState(false);

  const pausedRef = React.useRef(false);
  pausedRef.current = paused;

  const debugRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    videoCapture.connect().then(() => {
      setReady(true);
      if (isFaceDetectorAvailable()) {
        return startFaceDetectionLoop(() => videoCapture.lastVideo ?? null);
      }
    });
  }, []);

  React.useEffect(
    () =>
      subscribeToTick(() => {
        if (!pausedRef.current) {
          updateDvdStateMachine();
          lerpState.hue = (lerpState.hue + 0.15) % 360;
          lerpToward(lerpState, targetState, LERP_SPEED);
        }

        // Debug overlay — direct DOM write, no React re-render
        const dbg = debugRef.current;
        if (dbg && !pausedRef.current) {
          const s = lerpState;
          const w = (v: number) => v > 0.01;
          const fmt = (label: string, weight: number) => `${label}:${weight.toFixed(2)}`;
          const parts: string[] = [
            `tint h${Math.round(s.hue)} s${Math.round(s.sat)} l${Math.round(s.lig)}`,
          ];
          if (w(s.mirrorWeight))      parts.push(fmt('mirror', s.mirrorWeight));
          if (w(s.duotoneWeight))     parts.push(fmt('duotone', s.duotoneWeight));
          if (w(s.chromaticWeight))   parts.push(fmt('chromatic', s.chromaticWeight));
          if (w(s.glitchWeight))      parts.push(fmt('glitch', s.glitchWeight));
          if (w(s.edgeWeight))        parts.push(fmt('edge', s.edgeWeight));
          if (w(s.grainWeight))       parts.push(fmt('grain', s.grainWeight));
          if (w(s.pixelateWeight))    parts.push(fmt('pixelate', s.pixelateWeight));
          if (w(s.posterizeWeight))   parts.push(fmt('posterize', s.posterizeWeight));
          if (w(s.scanlinesWeight))   parts.push(fmt('scanlines', s.scanlinesWeight));
          if (w(s.tileWeight))        parts.push(fmt('tile', s.tileWeight));
          if (w(s.ghostWeight))       parts.push(fmt('ghost', s.ghostWeight));
          if (w(s.halftoneWeight))    parts.push(fmt('halftone', s.halftoneWeight));
          if (w(s.asciiWeight))       parts.push(fmt('ascii', s.asciiWeight));
          if (w(s.ditherWeight))      parts.push(fmt('dither', s.ditherWeight));
          if (w(s.rippleWeight))       parts.push(fmt('ripple', s.rippleWeight));
          if (w(s.dvdWeight))          parts.push(fmt('dvd', s.dvdWeight));
          if (dvdPhase.name !== 'idle') parts.push(`dvd:${dvdPhase.name}`);
          if (w(s.faceOverlayWeight))  parts.push(fmt('face', s.faceOverlayWeight));
          dbg.textContent = parts.join('  ');
        }
      }),
    [subscribeToTick],
  );

  React.useEffect(() => {
    pickRandomTarget();

    function scheduleNext() {
      const delay = randomBetween(10000, 20000);
      return window.setTimeout(() => {
        pickRandomTarget();
        timeoutId = scheduleNext();
      }, delay);
    }

    let timeoutId = scheduleNext();
    return () => window.clearTimeout(timeoutId);
  }, []);

  const frameProvider = React.useCallback(() => {
    const { video } = videoCapture.update();
    if (!video) return null;
    return { renderSource: new VideoRenderSource(video), fit: 'cover' as const, offset: undefined };
  }, []);

  const getEffectsState = React.useCallback(
    () => {
      const state = lerpStateToEffects(lerpState);
      state.configMap!.dvd = lerpState.dvdWeight > 0.01
        ? { enabled: true, imageUrl: dvdCurrentImageUrl, scale: 0.375 }
        : { enabled: false };
      return state;
    },
    [],
  );

  const canvasContainerRef = React.useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 16, padding: 16 }}>
      <div>
        <Group mb="sm">
          <Button
            variant={paused ? 'filled' : 'subtle'}
            color="orange"
            onClick={() => setPaused(p => !p)}
          >
            {paused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="subtle" onClick={openInNewTab}>
            Open in new tab
          </Button>
          <Button variant="subtle" onClick={toggleFullscreen}>
            Fullscreen
          </Button>
        </Group>
        <div
          ref={canvasContainerRef}
          style={{
            backgroundColor: 'black',
            position: 'relative',
            display: 'inline-block',
            width: isFullscreen ? screen.width : DISPLAY_WIDTH,
            height: isFullscreen ? screen.height : DISPLAY_HEIGHT,
          }}
        >
          {ready && (
            <RendererSurface
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              frameProvider={frameProvider}
              getEffectsState={getEffectsState}
              style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }}
            />
          )}
          <div
            ref={debugRef}
            style={{
              position: 'absolute',
              bottom: 6,
              left: 8,
              color: paused ? 'orange' : 'rgba(255,255,255,0.85)',
              fontSize: 11,
              fontFamily: 'monospace',
              pointerEvents: paused ? 'auto' : 'none',
              userSelect: paused ? 'text' : 'none',
              textShadow: '0 0 4px black',
            }}
          />
        </div>
      </div>
    </div>
  );
};
