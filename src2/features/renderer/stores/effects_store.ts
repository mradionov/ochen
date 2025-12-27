import { SyncStore } from '../../../lib/store';

export type EffectsState = {};

export class EffectsStore extends SyncStore<EffectsState> {
  static createEmpty() {
    return new EffectsStore();
  }

  hydrate(_other: EffectsState) {
    // No-op for now
  }

  getSnapshot() {
    return {};
  }
}
