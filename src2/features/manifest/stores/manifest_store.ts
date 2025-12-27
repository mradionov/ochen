import { SyncStore } from '../../../lib/store';
import { AudioTrackStore, type AudioTrackState } from './audio_track_store';
import { VideoTrackStore, type VideoTrackState } from './video_track_store';

export type ManifestState = {
  projectName: string;
  videoTrack: VideoTrackState;
  audioTrack: AudioTrackState;
};

type InternalManifestState = Omit<ManifestState, 'videoTrack' | 'audioTrack'>;

export class ManifestStore extends SyncStore<ManifestState> {
  private state: ManifestState;

  readonly videoTrackStore: VideoTrackStore;
  readonly audioTrackStore: AudioTrackStore;

  constructor(
    initialState: InternalManifestState,
    videoTrackStore: VideoTrackStore,
    audioTrackStore: AudioTrackStore,
  ) {
    super();

    this.videoTrackStore = videoTrackStore;
    this.videoTrackStore.subscribe(this.recomputeState);

    this.audioTrackStore = audioTrackStore;
    this.audioTrackStore.subscribe(this.recomputeState);

    this.state = this.recomputeState(initialState, false);
  }

  static createEmpty(): ManifestStore {
    return new ManifestStore(
      { projectName: 'Empty store' },
      VideoTrackStore.createEmpty(),
      AudioTrackStore.createEmpty(),
    );
  }

  private readonly recomputeState = (
    fromState: InternalManifestState = this.state,
    shouldEmit = true,
  ): ManifestState => {
    console.log('ManifestStore#recomputeState');
    this.state = {
      projectName: fromState.projectName,
      videoTrack: this.videoTrackStore.getSnapshot(),
      audioTrack: this.audioTrackStore.getSnapshot(),
    };
    if (shouldEmit) {
      this.emit();
    }
    return this.state;
  };

  hydrate(other: ManifestState) {
    this.videoTrackStore.hydrate(other.videoTrack);
    this.audioTrackStore.hydrate(other.audioTrack);

    this.recomputeState(other);
  }

  readonly getSnapshot = () => {
    return this.state;
  };
}
