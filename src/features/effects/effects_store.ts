import { SyncStore } from '../../lib/store';
import type { EffectsRaw, EffectType } from '../effects/effects_schema';

export type EdgeEffectConfig = {
  threshold?: number;
  transparency?: number;
  strength?: number;
};

export type GlitchEffectConfig = {};

export type GrainEffectConfig = {
  intensity?: number;
};

export type EffectsState = {
  configMap?: {
    tint?: string;
    vignette?: boolean;
    grain?: GrainEffectConfig;
    blur?: number;
    edge?: EdgeEffectConfig;
    glitch?: GlitchEffectConfig;
  };
  order?: EffectType[];
};

export class EffectsStore extends SyncStore<EffectsState> {
  private state: EffectsState;

  constructor(initialState: EffectsState = {}) {
    super();

    this.state = this.recomputeState(initialState, false);
  }

  private recomputeState(
    fromState: EffectsState,
    shouldEmit = true,
  ): EffectsState {
    this.state = {
      ...fromState,
    };
    if (shouldEmit) {
      this.emit();
    }
    return this.state;
  }

  static createEmpty() {
    return new EffectsStore();
  }

  hydrate(other: EffectsState) {
    this.recomputeState(other);
  }

  setTint(color: string) {
    this.recomputeState({
      ...this.state,
      configMap: {
        ...this.state.configMap,
        tint: color,
      },
    });
  }

  getSnapshot() {
    return this.state;
  }

  toRaw(): EffectsRaw {
    return {
      configMap: {
        tint: this.state.configMap?.tint
          ? this.state.configMap.tint
          : undefined,
        grain: this.state.configMap?.grain
          ? {
              intensity: this.state.configMap.grain?.intensity,
            }
          : undefined,
        edge: this.state.configMap?.edge
          ? {
              threshold: this.state.configMap.edge?.threshold,
            }
          : undefined,
      },
      order: this.state.order,
    };
  }
}
