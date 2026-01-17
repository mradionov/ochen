import { SyncStore } from '../../../lib/store';
import type { ManifestState, ManifestStore } from './manifest_store';

export type ManifestVersionState = {
  original: ManifestState;
  modified: ManifestState;
  hasChanges: boolean;
};

export class ManifestVersionStore extends SyncStore<ManifestVersionState> {
  private state: ManifestVersionState;
  private readonly manifestStore: ManifestStore;

  constructor(manifestStore: ManifestStore) {
    super();

    this.manifestStore = manifestStore;
    this.manifestStore.subscribe(() => {
      this.recomputeState();
    });

    this.state = this.recomputeState(this.manifestStore.getSnapshot(), false);
  }

  private readonly recomputeState = (
    originalState: ManifestState = this.state.original,
    shouldEmit = true,
  ): ManifestVersionState => {
    const modifiedState = this.manifestStore.getSnapshot();

    const hasChanges =
      JSON.stringify(originalState) !== JSON.stringify(modifiedState);

    this.state = {
      original: originalState,
      modified: modifiedState,
      hasChanges,
    };

    if (shouldEmit) {
      this.emit();
    }

    return this.state;
  };

  resetVersioning() {
    this.recomputeState(this.manifestStore.getSnapshot());
  }

  readonly getSnapshot = (): ManifestVersionState => {
    return this.state;
  };
}
