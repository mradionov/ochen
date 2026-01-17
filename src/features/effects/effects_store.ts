import { SyncStore } from '../../lib/store';
import {
  EffectsConfigMap,
  type EffectsRaw,
  type EffectType,
} from '../effects/effects_schema';

export type EffectsState = EffectsRaw;

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
      ...this.state,
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
    this.setConfig('tint', { enabled: true, value: color });
  }

  setGrain({ intensity }: { intensity: number }) {
    this.setConfig('grain', { enabled: true, intensity });
  }

  setEnabled(type: EffectType, isEnabled: boolean) {
    this.setConfig(
      type,
      EffectsConfigMap.shape[type].parse({ enabled: isEnabled }),
    );
  }

  setOrder(order: EffectType[]) {
    this.recomputeState({
      ...this.state,
      order,
    });
  }

  private setConfig<T>(type: EffectType, config: T) {
    this.recomputeState({
      configMap: EffectsConfigMap.parse({
        ...this.state.configMap,
        [type]: EffectsConfigMap.shape[type].parse({
          ...(this.state.configMap?.[type] || { enabled: true }),
          ...config,
        }),
      }),
    });
  }

  getSnapshot() {
    return this.state;
  }

  toRaw(): EffectsRaw {
    return {
      configMap: this.state.configMap,
      order: this.state.order,
    };
  }
}
