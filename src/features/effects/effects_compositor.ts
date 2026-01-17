import type { EffectRenderer, EffectRendererContext } from './effect_renderer';
import { EdgeEffectRenderer } from './effects/edge/edge_effect_renderer';
import { GrainEffectRenderer } from './effects/grain/grain_effect_renderer';
import { TintEffectRenderer } from './effects/tint/tint_effect_renderer';
import { VignetteEffectRenderer } from './effects/vignette/vignette_effect_renderer';
import { defaultEffectsOrder, type EffectType } from './effects_schema';
import type { EffectsState } from './effects_store';

export class EffectsCompositor {
  private readonly effectRendererMap: Record<
    EffectType,
    EffectRenderer<EffectType>
  >;

  constructor() {
    this.effectRendererMap = {
      grain: new GrainEffectRenderer(),
      edge: new EdgeEffectRenderer(),
      tint: new TintEffectRenderer(),
      vignette: new VignetteEffectRenderer(),
    };
  }

  async applyEffects(
    effectsState: EffectsState,
    effectContext: EffectRendererContext,
  ) {
    const defaultOrder = effectsState.order ?? defaultEffectsOrder;

    for (const effectKey of defaultOrder) {
      const effectConfig = effectsState.configMap?.[effectKey];
      if (effectConfig == null || !effectConfig.enabled) {
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
