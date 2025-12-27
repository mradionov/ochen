import { SyncStore } from '../../../lib/store';

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
}
