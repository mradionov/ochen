import { SyncStore } from '../../../lib/store';
import { AudioClipSchema, type AudioClipRaw } from '../manifest_schema';

export type AudioClipState = {
  audioId: string;
  audioPath: string;
  trimEnd: number | undefined;
};

export class AudioClipStore extends SyncStore<AudioClipState> {
  private state: AudioClipState;

  constructor(initialState: AudioClipState) {
    super();

    this.state = this.recomputeState(initialState, false);
  }

  private readonly recomputeState = (
    fromState: AudioClipState = this.state,
    shouldEmit = true,
  ): AudioClipState => {
    this.state = {
      ...fromState,
    };
    if (shouldEmit) {
      this.emit();
    }
    return this.state;
  };

  get audioId() {
    return this.state.audioId;
  }

  setTrimEnd(trimEnd: number | undefined) {
    this.recomputeState({ ...this.state, trimEnd });
  }

  getSnapshot() {
    return {
      audioId: this.state.audioId,
      audioPath: this.state.audioPath,
      trimEnd: this.state.trimEnd,
    };
  }

  toRaw(): AudioClipRaw {
    return AudioClipSchema.parse({
      audioId: this.state.audioId,
      trimEnd: this.state.trimEnd,
    });
  }
}
