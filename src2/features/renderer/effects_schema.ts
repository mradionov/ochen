import * as z from 'zod';

export const EffectsSchema = z.object({
  tint: z.string().optional(),
  vignette: z.boolean().optional(),
  grain: z
    .object({
      intensity: z.number().optional(),
    })
    .optional(),
  blur: z.number().optional(),
  edge: z
    .object({
      threshold: z.number().optional(),
      distance: z.number().optional(),
    })
    .optional(),
  glitch: z.object({}).optional(),
  order: z.array(z.string()).optional(),
});
export type EffectsRaw = z.infer<typeof EffectsSchema>;
