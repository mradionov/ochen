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
  'tint',
  'edge',
  'grain',
  'vignette',
];
