import * as z from 'zod';

export const EffectsConfigMap = z.object({
  tint: z.string().optional(),
  grain: z
    .object({
      intensity: z.number().optional(),
    })
    .optional(),
  edge: z
    .object({
      threshold: z.number().optional(),
      distance: z.number().optional(),
    })
    .optional(),
  glitch: z.object({}).optional(),
  vignette: z.boolean().optional(),
});

export type EffectType = keyof typeof EffectsConfigMap.shape;

export const EffectsSchema = z.object({
  configMap: EffectsConfigMap.optional(),
  order: z.array(EffectsConfigMap.keyof()).optional(),
});

export type EffectsRaw = z.infer<typeof EffectsSchema>;
