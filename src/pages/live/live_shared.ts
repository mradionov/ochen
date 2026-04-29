import { hslToHex } from '../../lib/color';
import type { EffectsState } from '../../features/effects/effects_store';

export const LERP_SPEED = 0.015;

export type LerpState = {
  hue: number;
  sat: number;
  lig: number;
  edgeWeight: number;
  edgeThreshold: number;
  edgeTransparency: number;
  edgeStrength: number;
  grainWeight: number;
  grainIntensity: number;
  pixelateWeight: number;
  pixelateBlockSize: number;
  glitchWeight: number;
  glitchIntensity: number;
  glitchSlices: number;
  duotoneWeight: number;
  chromaticWeight: number;
  chromaticOffset: number;
  scanlinesWeight: number;
  scanlinesGap: number;
  scanlinesOpacity: number;
  mirrorWeight: number;
  posterizeWeight: number;
  posterizeLevels: number;
  tileWeight: number;
  tileCols: number;
  tileRows: number;
  channelSwapWeight: number;
  dvdWeight: number;
  ghostWeight: number;
  ghostDecay: number;
  halftoneWeight: number;
  halftoneCellSize: number;
  asciiWeight: number;
  asciiCellSize: number;
  ditherWeight: number;
  rippleWeight: number;
  rippleAmplitude: number;
  rippleFrequency: number;
  faceOverlayWeight: number;
};

export const DEFAULT_LERP_STATE: LerpState = {
  hue: 0,
  sat: 100,
  lig: 45,
  edgeWeight: 0,
  edgeThreshold: 80,
  edgeTransparency: 60,
  edgeStrength: 1,
  grainWeight: 0,
  grainIntensity: 50,
  pixelateWeight: 0,
  pixelateBlockSize: 16,
  glitchWeight: 0,
  glitchIntensity: 10,
  glitchSlices: 10,
  duotoneWeight: 0,
  chromaticWeight: 0,
  chromaticOffset: 8,
  scanlinesWeight: 0,
  scanlinesGap: 4,
  scanlinesOpacity: 0.5,
  mirrorWeight: 0,
  posterizeWeight: 0,
  posterizeLevels: 4,
  tileWeight: 0,
  tileCols: 2,
  tileRows: 2,
  channelSwapWeight: 0,
  dvdWeight: 0,
  ghostWeight: 0,
  ghostDecay: 0.5,
  halftoneWeight: 0,
  halftoneCellSize: 8,
  asciiWeight: 0,
  asciiCellSize: 8,
  ditherWeight: 0,
  rippleWeight: 0,
  rippleAmplitude: 8,
  rippleFrequency: 0.04,
  faceOverlayWeight: 0,
};

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function lerpHue(a: number, b: number, t: number) {
  const diff = ((b - a + 540) % 360) - 180;
  return (a + diff * t + 360) % 360;
}

// Weights snap to 0 immediately when target is 0 (instant off, smooth fade-in)
function lerpWeight(current: number, target: number, speed: number) {
  return target === 0 ? 0 : lerp(current, target, speed);
}

export function lerpToward(current: LerpState, target: LerpState, speed: number) {
  current.sat = lerp(current.sat, target.sat, speed);
  current.lig = lerp(current.lig, target.lig, speed);
  current.edgeWeight = lerpWeight(current.edgeWeight, target.edgeWeight, speed);
  current.edgeThreshold = lerp(current.edgeThreshold, target.edgeThreshold, speed);
  current.edgeTransparency = lerp(current.edgeTransparency, target.edgeTransparency, speed);
  current.edgeStrength = lerp(current.edgeStrength, target.edgeStrength, speed);
  current.grainWeight = lerpWeight(current.grainWeight, target.grainWeight, speed);
  current.grainIntensity = lerp(current.grainIntensity, target.grainIntensity, speed);
  current.pixelateWeight = lerpWeight(current.pixelateWeight, target.pixelateWeight, speed);
  current.pixelateBlockSize = lerp(current.pixelateBlockSize, target.pixelateBlockSize, speed);
  current.glitchWeight = lerpWeight(current.glitchWeight, target.glitchWeight, speed);
  current.glitchIntensity = lerp(current.glitchIntensity, target.glitchIntensity, speed);
  current.glitchSlices = lerp(current.glitchSlices, target.glitchSlices, speed);
  current.duotoneWeight = lerpWeight(current.duotoneWeight, target.duotoneWeight, speed);
  current.chromaticWeight = lerpWeight(current.chromaticWeight, target.chromaticWeight, speed);
  current.chromaticOffset = lerp(current.chromaticOffset, target.chromaticOffset, speed);
  current.scanlinesWeight = lerpWeight(current.scanlinesWeight, target.scanlinesWeight, speed);
  current.scanlinesGap = lerp(current.scanlinesGap, target.scanlinesGap, speed);
  current.scanlinesOpacity = lerp(current.scanlinesOpacity, target.scanlinesOpacity, speed);
  current.mirrorWeight = lerpWeight(current.mirrorWeight, target.mirrorWeight, speed);
  current.posterizeWeight = lerpWeight(current.posterizeWeight, target.posterizeWeight, speed);
  current.posterizeLevels = lerp(current.posterizeLevels, target.posterizeLevels, speed);
  current.tileWeight = lerpWeight(current.tileWeight, target.tileWeight, speed);
  current.tileCols = lerp(current.tileCols, target.tileCols, speed);
  current.tileRows = lerp(current.tileRows, target.tileRows, speed);
  current.channelSwapWeight = lerpWeight(current.channelSwapWeight, target.channelSwapWeight, speed);
  current.dvdWeight = lerpWeight(current.dvdWeight, target.dvdWeight, speed);
  current.ghostWeight = lerpWeight(current.ghostWeight, target.ghostWeight, speed);
  current.ghostDecay = lerp(current.ghostDecay, target.ghostDecay, speed);
  current.halftoneWeight = lerpWeight(current.halftoneWeight, target.halftoneWeight, speed);
  current.halftoneCellSize = lerp(current.halftoneCellSize, target.halftoneCellSize, speed);
  current.asciiWeight = lerpWeight(current.asciiWeight, target.asciiWeight, speed);
  current.asciiCellSize = lerp(current.asciiCellSize, target.asciiCellSize, speed);
  current.ditherWeight = lerpWeight(current.ditherWeight, target.ditherWeight, speed);
  current.rippleWeight = lerpWeight(current.rippleWeight, target.rippleWeight, speed);
  current.rippleAmplitude = lerp(current.rippleAmplitude, target.rippleAmplitude, speed);
  current.rippleFrequency = lerp(current.rippleFrequency, target.rippleFrequency, speed);
  current.faceOverlayWeight = lerpWeight(current.faceOverlayWeight, target.faceOverlayWeight, speed);
}

export function lerpStateToEffects(s: LerpState): EffectsState {
  const w = (weight: number) => weight > 0.01;
  return {
    configMap: {
      tint: {
        enabled: true,
        value: hslToHex({ h: Math.round(s.hue), s: Math.round(s.sat), l: Math.round(s.lig) }),
      },
      edge: w(s.edgeWeight) ? {
        enabled: true,
        threshold: Math.round(lerp(255, s.edgeThreshold, s.edgeWeight)),
        transparency: Math.round(lerp(255, s.edgeTransparency, s.edgeWeight)),
        strength: s.edgeStrength * s.edgeWeight,
      } : { enabled: false },
      grain: w(s.grainWeight)
        ? { enabled: true, intensity: Math.round(s.grainIntensity * s.grainWeight) }
        : { enabled: false },
      pixelate: w(s.pixelateWeight)
        ? { enabled: true, blockSize: Math.round(lerp(1, s.pixelateBlockSize, s.pixelateWeight)) }
        : { enabled: false },
      glitch: w(s.glitchWeight)
        ? { enabled: true, intensity: s.glitchIntensity * s.glitchWeight, sliceCount: Math.round(s.glitchSlices) }
        : { enabled: false },
      duotone: w(s.duotoneWeight)
        ? { enabled: true }
        : { enabled: false },
      chromatic: w(s.chromaticWeight)
        ? { enabled: true, offset: Math.round(s.chromaticOffset * s.chromaticWeight) }
        : { enabled: false },
      scanlines: w(s.scanlinesWeight)
        ? { enabled: true, gap: Math.round(s.scanlinesGap), opacity: s.scanlinesOpacity * s.scanlinesWeight }
        : { enabled: false },
      mirror: { enabled: w(s.mirrorWeight) },
      posterize: w(s.posterizeWeight)
        ? { enabled: true, levels: Math.round(lerp(2, s.posterizeLevels, s.posterizeWeight)) }
        : { enabled: false },
      tile: w(s.tileWeight)
        ? { enabled: true, cols: Math.round(s.tileCols), rows: Math.round(s.tileRows) }
        : { enabled: false },
      channelSwap: { enabled: w(s.channelSwapWeight) },
      ghost: w(s.ghostWeight)
        ? { enabled: true, decay: s.ghostDecay }
        : { enabled: false },
      halftone: w(s.halftoneWeight)
        ? { enabled: true, cellSize: Math.round(lerp(4, s.halftoneCellSize, s.halftoneWeight)) }
        : { enabled: false },
      ascii: w(s.asciiWeight)
        ? { enabled: true, cellSize: Math.round(lerp(4, s.asciiCellSize, s.asciiWeight)) }
        : { enabled: false },
      dither: { enabled: w(s.ditherWeight) },
      ripple: w(s.rippleWeight)
        ? { enabled: true, amplitude: s.rippleAmplitude * s.rippleWeight, frequency: s.rippleFrequency }
        : { enabled: false },
      faceOverlay: w(s.faceOverlayWeight)
        ? {
            enabled: true,
            dotRadius: 3,
            color: '#00ffcc',
            mirrored: w(s.mirrorWeight),
            tileCols: w(s.tileWeight) ? Math.round(s.tileCols) : 1,
            tileRows: w(s.tileWeight) ? Math.round(s.tileRows) : 1,
          }
        : { enabled: false },
    },
    order: ['dvd', 'ghost', 'ripple', 'mirror', 'duotone', 'channelSwap', 'tint', 'chromatic', 'glitch', 'edge', 'grain', 'pixelate', 'dither', 'halftone', 'ascii', 'posterize', 'scanlines', 'tile', 'faceOverlay'],
  };
}
