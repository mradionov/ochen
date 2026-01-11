import { SyncStore } from '../../lib/store';
import type { AudioId } from '../manifest/manifest_schema';

export type AudioMetadata = {
  audioId: AudioId;
  audioPath: string;
  duration: number;
};

export type AudioResolverState = {
  audios: Record<AudioId, AudioMetadata>;
};

export type AudioResolverSnap = {
  state: AudioResolverState;
  getDuration: (audioId: AudioId) => number;
};

export class AudioResolverStore extends SyncStore<AudioResolverSnap> {
  private state: AudioResolverState;
  private snap: AudioResolverSnap;

  constructor() {
    super();

    const initialState: AudioResolverState = { audios: {} };

    const { state, snap } = this.setState(initialState, false);

    this.state = state;
    this.snap = snap;
  }

  private setState(nextState: AudioResolverState, shouldEmit = true) {
    this.state = nextState;
    this.snap = this.makeSnap(nextState);

    if (shouldEmit) {
      this.emit();
    }

    return { state: this.state, snap: this.snap };
  }

  addMetadata(audioId: AudioId, metadata: AudioMetadata) {
    this.setState({
      ...this.state,
      audios: {
        ...this.state.audios,
        [audioId]: metadata,
      },
    });
  }

  hasMetadata(audioId: AudioId) {
    return this.state.audios[audioId] != null;
  }

  private makeSnap(state: AudioResolverState): AudioResolverSnap {
    return {
      state,
      getDuration: (audioId: AudioId) => state.audios[audioId]?.duration ?? 0,
    };
  }

  readonly getSnapshot = () => {
    return this.snap;
  };
}
