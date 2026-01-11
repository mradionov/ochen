import { Deferred } from '../../lib/deferred';
import { TaskQueue } from '../../lib/task_queue';
import type { VideoId } from '../manifest/manifest_schema';
import type { VideoMetadata, VideoResolverStore } from './video_resolver_store';

export type VideoRef = {
  videoId: VideoId;
  videoPath: string;
};

export class VideoResolver {
  private readonly videoResolverStore: VideoResolverStore;
  private readonly taskQueue = new TaskQueue();

  constructor(videoResolverStore: VideoResolverStore) {
    this.videoResolverStore = videoResolverStore;
  }

  async loadMetadata(refs: VideoRef[]) {
    for (const ref of refs) {
      await this.loadMetadataOne(ref);
    }
  }

  async loadMetadataOne(ref: VideoRef): Promise<void> {
    // Create one by one to speed up the process, video elements are struggling if it's done at the
    // same time
    return this.taskQueue.run(() => {
      return this.doLoadMetadataOne(ref);
    });
  }

  private async doLoadMetadataOne(ref: VideoRef): Promise<void> {
    if (this.videoResolverStore.hasMetadata(ref.videoId)) {
      return;
    }

    const loadedMetadata = new Deferred<void>();

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = ref.videoPath;
    video.addEventListener(
      'loadedmetadata',
      () => {
        loadedMetadata.resolve();
      },
      { once: true },
    );

    await loadedMetadata.promise;

    const metadata: VideoMetadata = {
      videoId: ref.videoId,
      videoPath: ref.videoPath,
      duration: video.duration,
    };

    this.videoResolverStore.addMetadata(ref.videoId, metadata);

    video.removeAttribute('src');
    video.load();
  }
}
