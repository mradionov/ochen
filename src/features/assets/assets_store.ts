import { SyncStore } from '../../lib/store';
import type { VideoFileAsset } from './assets_controller';

export type AssetsState = {
  videoFileAssets: VideoFileAsset[];
};

export class AssetsStore extends SyncStore<AssetsState> {
  private state: AssetsState;

  constructor() {
    super();
    this.state = {
      videoFileAssets: [],
    };
  }

  private readonly recomputeState = (
    fromState: Partial<AssetsState> = this.state,
    shouldEmit = true,
  ): AssetsState => {
    this.state = {
      ...this.state,
      ...fromState,
    };
    if (shouldEmit) {
      this.emit();
    }
    return this.state;
  };

  hydrateVideoFileAssets(videoFileAssets: VideoFileAsset[]) {
    this.recomputeState({ videoFileAssets });
  }

  deleteVideoFile(fileName: string) {
    const updatedVideoFileAssets = this.state.videoFileAssets.filter(
      (asset) => asset.name !== fileName,
    );
    this.recomputeState({ videoFileAssets: updatedVideoFileAssets });
  }

  readonly getSnapshot = () => {
    return this.state;
  };
}
