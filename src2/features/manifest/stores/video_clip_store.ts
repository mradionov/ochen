import { isImage } from '../../../lib/image_utils';
import { SyncStore } from '../../../lib/store';
import {
  EffectsStore,
  type EffectsState,
} from '../../renderer/stores/effects_store';
import {
  VideoClipSchema,
  VideoTransitionOutSchema,
  type VideoFilepath,
  type VideoId,
  type VideoTransitionOut,
} from '../manifest_schema';

export type VideoClipState = {
  videoId: string;
  videoPath: string;
  duration: number;
  offsetX: number | string;
  offsetY: number | string;
  rate: number;
  trimEnd: number;
  transitionOut: VideoTransitionOut;
  effects: EffectsState;
};

type InternalVideoClipState = Omit<VideoClipState, 'effects'>;

export class VideoClipStore extends SyncStore<VideoClipState> {
  state: InternalVideoClipState;
  readonly effectsStore: EffectsStore;

  constructor(
    initialState: InternalVideoClipState,
    effectsStore: EffectsStore,
  ) {
    super();

    this.state = initialState;

    this.effectsStore = effectsStore;
    this.effectsStore.subscribe(this.emit);
  }

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

  get videoId() {
    return this.state.videoId;
  }

  isImage() {
    return isImage(this.state.videoPath);
  }

  getSnapshot() {
    return {
      videoId: this.state.videoId,
      videoPath: this.state.videoPath,
      duration: this.state.duration,
      offsetX: this.state.offsetX,
      offsetY: this.state.offsetY,
      rate: this.state.rate,
      trimEnd: this.state.trimEnd,
      transitionOut: this.state.transitionOut,
      effects: this.effectsStore.getSnapshot(),
    };
  }
}
