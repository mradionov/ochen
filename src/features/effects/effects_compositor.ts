import type { EffectRenderer, EffectRendererContext } from './effect_renderer';
import { EdgeEffectRenderer } from './effect_renderers/edge';
import { GlitchEffectRenderer } from './effect_renderers/glitch';
import { GrainEffectRenderer } from './effect_renderers/grain';
import { TintEffectRenderer } from './effect_renderers/tint';
import { VignetteEffectRenderer } from './effect_renderers/vignette';
import type { EffectType } from './effects_schema';
import type { EffectsState } from './effects_store';

export class EffectsCompositor {
  private readonly effectRendererMap: Record<
    EffectType,
    EffectRenderer<unknown>
  >;

  constructor() {
    this.effectRendererMap = {
      grain: new GrainEffectRenderer(),
      edge: new EdgeEffectRenderer(),
      tint: new TintEffectRenderer(),
      glitch: new GlitchEffectRenderer(),
      vignette: new VignetteEffectRenderer(),
    };
  }

  async applyEffects(
    effectsState: EffectsState,
    effectContext: EffectRendererContext,
  ) {
    const defaultOrder = effectsState.order ?? [
      'tint',
      'edge',
      'glitch',
      'grain',
      'vignette',
    ];

    for (const effectKey of defaultOrder) {
      const effectConfig = effectsState.configMap?.[effectKey];
      if (effectConfig == null) {
        continue;
      }
      const effectRenderer = this.effectRendererMap[effectKey];
      if (!effectRenderer) {
        continue;
      }

      await effectRenderer.render(effectContext, effectConfig);
      //   await effect.apply(effectContext, effectConfig, audioInfo);
    }
  }
}
