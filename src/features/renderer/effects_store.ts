import { SyncStore } from '../../lib/store';
import type { EffectsRaw } from './effects_schema';

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
  tint?: string;
  vignette?: boolean;
  grain?: GrainEffectConfig;
  blur?: number;
  edge?: EdgeEffectConfig;
  glitch?: GlitchEffectConfig;
  order?: string[];
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
      tint: color,
    });
  }

  getSnapshot() {
    return this.state;
  }

  toRaw(): EffectsRaw {
    return {
      tint: this.state.tint,
      vignette: this.state.vignette,
      grain: {
        intensity: this.state.grain?.intensity,
      },
      blur: this.state.blur,
      edge: {
        threshold: this.state.edge?.threshold,
      },
      glitch: this.state.glitch,
      order: this.state.order,
    };
  }
}
