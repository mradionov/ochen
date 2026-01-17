import { SyncStore } from '../../lib/store';
import type { ManifestStore } from '../manifest/stores/manifest_store';
import type { VideoResolverStore } from '../video_resolver/video_resolver_store';
import { VideoTimelineSelectors } from './video_timeline_selectors';

export type VideoTimelineSnap = VideoTimelineSelectors;

export class VideoTimelineStore extends SyncStore<VideoTimelineSnap> {
  private readonly manifestStore: ManifestStore;
  private readonly videoResolverStore: VideoResolverStore;
  private snap: VideoTimelineSnap;

  constructor(
    manifestStore: ManifestStore,
    videoResolverStore: VideoResolverStore,
  ) {
    super();

    this.manifestStore = manifestStore;
    this.manifestStore.subscribe(this.recomputeSnap);

    this.videoResolverStore = videoResolverStore;
    this.videoResolverStore.subscribe(this.recomputeSnap);

    this.snap = this.recomputeSnap(false);
  }

  private readonly recomputeSnap = (shouldEmit = true): VideoTimelineSnap => {
    const manifestState = this.manifestStore.getSnapshot();
    const videoResolverSnap = this.videoResolverStore.getSnapshot();

    const videoTimelineSelectors = new VideoTimelineSelectors(
      manifestState,
      videoResolverSnap,
    );

    this.snap = videoTimelineSelectors;

    if (shouldEmit) {
      this.emit();
    }

    return this.snap;
  };

  readonly getSnapshot = (): VideoTimelineSnap => {
    return this.snap;
  };
}
