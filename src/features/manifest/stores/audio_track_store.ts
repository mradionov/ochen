import { Precondition } from '../../../lib/precondition';
import { SyncStore } from '../../../lib/store';
import {
  AudioTrackSchema,
  type AudioId,
  type AudioMap,
} from '../manifest_schema';
import { AudioClipStore, type AudioClipState } from './audio_clip_store';

export type AudioTrackState = {
  clips: AudioClipState[];
  audios: AudioMap;
};

type InternalAudioTrackState = Omit<AudioTrackState, 'clips'>;

export class AudioTrackStore extends SyncStore<AudioTrackState> {
  private state: AudioTrackState;

  private audioClipStores: AudioClipStore[];

  constructor(
    initialState: InternalAudioTrackState,
    audioClipStores: AudioClipStore[],
  ) {
    super();

    this.audioClipStores = audioClipStores;
    this.audioClipStores.forEach((clipStore) =>
      clipStore.subscribe(this.recomputeState),
    );

    this.state = this.recomputeState(initialState, false);
  }

  private readonly recomputeState = (
    fromState: InternalAudioTrackState = this.state,
    shouldEmit = true,
  ): AudioTrackState => {
    this.state = {
      clips: this.audioClipStores.map((clipStore) => clipStore.getSnapshot()),
      audios: fromState.audios,
    };
    if (shouldEmit) {
      this.emit();
    }
    return this.state;
  };

  static createEmpty() {
    return new AudioTrackStore({ audios: {} }, []);
  }

  hydrate(other: AudioTrackState) {
    this.audioClipStores.forEach((clipStore) => clipStore.dispose());
    this.audioClipStores = other.clips.map((clip) => {
      const clipStore = new AudioClipStore(clip);
      clipStore.subscribe(this.recomputeState);
      return clipStore;
    });

    this.state = {
      clips: this.audioClipStores.map((clipStore) => clipStore.getSnapshot()),
      audios: other.audios,
    };
  }

  getClipStore(id: AudioId): AudioClipStore {
    return Precondition.checkExists(this.findClipStore(id));
  }

  findClipStore(id: AudioId): AudioClipStore | undefined {
    return this.audioClipStores.find((clipStore) => clipStore.audioId === id);
  }

  readonly getSnapshot = () => {
    return this.state;
  };

  toRaw() {
    return AudioTrackSchema.parse({
      clips: this.audioClipStores.map((clipStore) => clipStore.toRaw()),
      audios: this.state.audios,
    });
  }
}
