import { SyncStore } from '../../../lib/store';
import {
  EffectsStore,
  type EffectsState,
} from '../../renderer/stores/effects_store';
import {
  VideoTransitionOutSchema,
  type VideoFilename,
  type VideoFilepath,
  type VideoId,
  type VideoMap,
  type VideoTransitionOut,
} from '../manifest_schema';
import { VideoClipStore, type VideoClipState } from './video_clip_store';

export type VideoTrackState = {
  clips: VideoClipState[];
  videos: VideoMap;
  transitionOut: VideoTransitionOut;
  effects: EffectsState;
};

type InternalVideoTrackState = Omit<VideoTrackState, 'clips' | 'effects'>;

export class VideoTrackStore extends SyncStore<VideoTrackState> {
  private state: VideoTrackState;

  private videoClipStores: VideoClipStore[];
  private effectsStore: EffectsStore;

  constructor(
    initialState: InternalVideoTrackState,
    videoClipStores: VideoClipStore[],
    effectsStore: EffectsStore,
  ) {
    super();

    this.videoClipStores = videoClipStores;
    this.effectsStore = effectsStore;

    this.state = this.recomputeState(initialState, false);
  }

  private recomputeState(
    fromState: InternalVideoTrackState,
    shouldEmit = true,
  ): VideoTrackState {
    this.state = {
      videos: fromState.videos,
      transitionOut: fromState.transitionOut,
      clips: this.videoClipStores.map((clipStore) => clipStore.getSnapshot()),
      effects: this.effectsStore.getSnapshot(),
    };
    if (shouldEmit) {
      this.emit();
    }
    return this.state;
  }

  static createEmpty() {
    return new VideoTrackStore(
      { videos: {}, transitionOut: VideoTransitionOutSchema.parse({}) },
      [],
      EffectsStore.createEmpty(),
    );
  }

  static selectVideoFilenames(state: VideoTrackState) {
    return Object.values(state.videos);
  }

  hydrate(other: VideoTrackState) {
    this.effectsStore.hydrate(other.effects);

    // TODO: re-sub stores?
    this.videoClipStores = other.clips.map(
      (clipState) => new VideoClipStore(clipState, this.effectsStore),
    );

    this.recomputeState(other);
  }

  private findClipStore(id: VideoId) {
    return this.videoClipStores.find((clipStore) => clipStore.videoId === id);
  }

  addClipAndVideo(filename: VideoFilename, path: VideoFilepath) {
    if (this.findClipStore(filename)) {
      return;
    }
    this.videoClipStores.push(
      VideoClipStore.createFromPath({ videoId: filename, videoPath: path }),
    );
    const newVideos = {
      ...this.state.videos,
      [filename]: filename,
    };
    this.recomputeState({
      ...this.state,
      videos: newVideos,
    });
  }

  removeClipAndVideo(id: VideoId) {
    this.videoClipStores = this.videoClipStores.filter(
      (clipStore) => clipStore.videoId !== id,
    );
    const { [id]: _, ...newVideos } = this.state.videos;
    this.recomputeState({
      ...this.state,
      videos: newVideos,
    });
  }

  moveLeft(id: VideoId) {
    const index = this.videoClipStores.findIndex(
      (clipStore) => clipStore.videoId === id,
    );
    if (index === 0) {
      return;
    }
    const leftIndex = index - 1;
    const temp = this.videoClipStores[index];
    this.videoClipStores[index] = this.videoClipStores[leftIndex];
    this.videoClipStores[leftIndex] = temp;

    this.recomputeState(this.state);
  }

  moveRight(id: VideoId) {
    const index = this.videoClipStores.findIndex(
      (clipStore) => clipStore.videoId === id,
    );
    if (index > this.videoClipStores.length - 1) {
      return;
    }
    const rightIndex = index + 1;
    const temp = this.videoClipStores[index];
    this.videoClipStores[index] = this.videoClipStores[rightIndex];
    this.videoClipStores[rightIndex] = temp;

    this.recomputeState(this.state);
  }

  readonly getSnapshot = () => {
    return this.state;
  };
}
