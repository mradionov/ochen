import { SyncStore } from '../../../lib/store';
import { AudioClipSchema, type AudioClipRaw } from '../manifest_schema';

export type AudioClipState = {
  audioId: string;
  audioPath: string;
  trimEnd: number;
};

export class AudioClipStore extends SyncStore<AudioClipState> {
  private state: AudioClipState;

  constructor(initialState: AudioClipState) {
    super();
    this.state = initialState;
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
