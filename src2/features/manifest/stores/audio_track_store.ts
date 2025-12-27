import { SyncStore } from '../../../lib/store';
import type { AudioMap } from '../manifest_schema';
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
    // this.clips.forEach((clip) => clip.subscribe(this.emit));

    this.state = {
      clips: this.audioClipStores.map((clipStore) => clipStore.getSnapshot()),
      audios: initialState.audios,
    };
  }

  static createEmpty() {
    return new AudioTrackStore({ audios: {} }, []);
  }

  hydrate(other: AudioTrackState) {
    // TODO: unsub old stores?
    this.audioClipStores = other.clips.map((clip) => new AudioClipStore(clip));

    this.state = {
      clips: this.audioClipStores.map((clipStore) => clipStore.getSnapshot()),
      audios: other.audios,
    };
  }

  readonly getSnapshot = () => {
    return this.state;
  };
}
