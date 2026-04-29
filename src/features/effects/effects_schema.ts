import * as z from 'zod';

const BaseEffectConfig = z.object({
  enabled: z.boolean(),
});

export const EffectsConfigMap = z.object({
  tint: BaseEffectConfig.extend({
    value: z.string().default('#000000'),
  }).optional(),
  edge: BaseEffectConfig.extend({
    threshold: z.number().optional(),
    transparency: z.number().optional(),
    strength: z.number().optional(),
  }).optional(),
  grain: BaseEffectConfig.extend({
    intensity: z.number().optional(),
  }).optional(),
  vignette: BaseEffectConfig.extend({}).optional(),
  pixelate: BaseEffectConfig.extend({
    blockSize: z.number().optional(),
  }).optional(),
  glitch: BaseEffectConfig.extend({
    intensity: z.number().optional(),
    sliceCount: z.number().optional(),
  }).optional(),
  duotone: BaseEffectConfig.extend({
    shadowColor: z.string().optional(),
    highlightColor: z.string().optional(),
  }).optional(),
  chromatic: BaseEffectConfig.extend({
    offset: z.number().optional(),
  }).optional(),
  scanlines: BaseEffectConfig.extend({
    gap: z.number().optional(),
    opacity: z.number().optional(),
  }).optional(),
  mirror: BaseEffectConfig.extend({}).optional(),
  posterize: BaseEffectConfig.extend({
    levels: z.number().optional(),
  }).optional(),
  tile: BaseEffectConfig.extend({
    cols: z.number().optional(),
    rows: z.number().optional(),
  }).optional(),
  channelSwap: BaseEffectConfig.extend({}).optional(),
  dvd: BaseEffectConfig.extend({
    imageUrl: z.string().optional(),
    scale: z.number().optional(),
  }).optional(),
  ghost: BaseEffectConfig.extend({
    decay: z.number().optional(),
  }).optional(),
  halftone: BaseEffectConfig.extend({
    cellSize: z.number().optional(),
  }).optional(),
  ascii: BaseEffectConfig.extend({
    cellSize: z.number().optional(),
  }).optional(),
  dither: BaseEffectConfig.extend({}).optional(),
  ripple: BaseEffectConfig.extend({
    amplitude: z.number().optional(),
    frequency: z.number().optional(),
  }).optional(),
  faceOverlay: BaseEffectConfig.extend({
    dotRadius: z.number().optional(),
    color: z.string().optional(),
    mirrored: z.boolean().optional(),
    tileCols: z.number().optional(),
    tileRows: z.number().optional(),
  }).optional(),
});

export type EffectsConfigMap = z.infer<typeof EffectsConfigMap>;

export type EffectType = keyof typeof EffectsConfigMap.shape;

export type EffectConfig<K extends EffectType> = NonNullable<
  EffectsConfigMap[K]
>;

export const EffectsSchema = z.object({
  configMap: EffectsConfigMap.optional(),
  order: z.array(EffectsConfigMap.keyof()).optional(),
});

export type EffectsRaw = z.infer<typeof EffectsSchema>;

export const defaultEffectsOrder: EffectType[] = [
  'mirror',
  'duotone',
  'tint',
  'chromatic',
  'glitch',
  'edge',
  'grain',
  'pixelate',
  'posterize',
  'scanlines',
  'vignette',
  'tile',
  'channelSwap',
  'dvd',
  'ghost',
  'halftone',
  'ascii',
  'dither',
  'ripple',
  'faceOverlay',
];
