import { SyncStore } from '../../lib/store';
import type { VideoId } from '../manifest/manifest_schema';

export type VideoMetadata = {
  videoId: string;
  videoPath: string;
  duration: number;
};

export type VideoResolverState = {
  videos: Record<VideoId, VideoMetadata>;
};

export type VideoResolverSnap = {
  state: VideoResolverState;
  getDuration: (videoId: VideoId) => number;
};

export class VideoResolverStore extends SyncStore<VideoResolverSnap> {
  private state: VideoResolverState;
  private snap: VideoResolverSnap;

  constructor() {
    super();

    const initialState: VideoResolverState = { videos: {} };

    const { state, snap } = this.setState(initialState, false);

    this.state = state;
    this.snap = snap;
  }

  private setState(
    nextState: VideoResolverState = this.state,
    shouldEmit = true,
  ) {
    this.state = nextState;
    this.snap = this.makeSnap(this.state);

    if (shouldEmit) {
      this.emit();
    }

    return { state: this.state, snap: this.snap };
  }

  addMetadata(videoId: VideoId, metadata: VideoMetadata) {
    this.setState({
      ...this.state,
      videos: {
        ...this.state.videos,
        [videoId]: metadata,
      },
    });
  }

  hasMetadata(videoId: VideoId) {
    return this.state.videos[videoId] != null;
  }

  private makeSnap(state: VideoResolverState): VideoResolverSnap {
    return {
      state,
      getDuration: (videoId: VideoId) => state.videos[videoId]?.duration ?? 0,
    };
  }

  readonly getSnapshot = () => {
    return this.snap;
  };
}
