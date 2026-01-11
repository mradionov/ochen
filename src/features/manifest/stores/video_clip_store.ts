import { isImage } from '../../../lib/image_utils';
import { SyncStore } from '../../../lib/store';
import { EffectsStore, type EffectsState } from '../../renderer/effects_store';
import {
  VideoClipSchema,
  VideoTransitionOutSchema,
  type VideoClipRaw,
  type VideoFilepath,
  type VideoId,
  type VideoTransitionOutRaw,
} from '../manifest_schema';

export type VideoClipState = {
  videoId: string;
  videoPath: string;
  duration: number;
  offsetX: number | string | undefined;
  offsetY: number | string | undefined;
  rate: number | undefined;
  trimEnd: number | undefined;
  transitionOut: VideoTransitionOutRaw | undefined;
  effects: EffectsState | undefined;
};

type InternalVideoClipState = Omit<VideoClipState, 'effects'>;

export class VideoClipStore extends SyncStore<VideoClipState> {
  state: VideoClipState;
  readonly effectsStore: EffectsStore;

  constructor(
    initialState: InternalVideoClipState,
    effectsStore: EffectsStore,
  ) {
    super();

    this.effectsStore = effectsStore;
    this.effectsStore.subscribe(this.recomputeState);

    this.state = this.recomputeState(initialState, false);
  }

  private readonly recomputeState = (
    fromState: InternalVideoClipState = this.state,
    shouldEmit = true,
  ): VideoClipState => {
    this.state = {
      ...fromState,
      effects: this.effectsStore.getSnapshot(),
    };
    if (shouldEmit) {
      this.emit();
    }
    return this.state;
  };

  static createFromPath({
    videoId,
    videoPath,
  }: {
    videoId: VideoId;
    videoPath: VideoFilepath;
  }) {
    return new VideoClipStore(
      {
        ...VideoClipSchema.parse({ videoId }),
        videoPath,
        transitionOut: VideoTransitionOutSchema.parse({}),
      },
      EffectsStore.createEmpty(),
    );
  }

  setRate(value: number | undefined) {
    this.recomputeState({
      ...this.state,
      rate: value,
    });
  }

  setCustomDuration(value: number | undefined) {
    this.recomputeState({
      ...this.state,
      duration: value ?? 0,
    });
  }

  setOffsetX(value: number | string | undefined) {
    this.recomputeState({
      ...this.state,
      offsetX: value,
    });
  }

  setOffsetY(value: number | string | undefined) {
    this.recomputeState({
      ...this.state,
      offsetY: value,
    });
  }

  get videoId() {
    return this.state.videoId;
  }

  isImage() {
    return isImage(this.state.videoPath);
  }

  getSnapshot() {
    return this.state;
  }

  toRaw(): VideoClipRaw {
    return VideoClipSchema.parse({
      videoId: this.state.videoId,
      duration: this.state.duration,
      offsetX: this.state.offsetX,
      offsetY: this.state.offsetY,
      rate: this.state.rate,
      trimEnd: this.state.trimEnd,
    });
  }
}
