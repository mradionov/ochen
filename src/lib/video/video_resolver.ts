import { Deferred } from '../../../src2/lib/deferred';
import { TaskQueue } from '$lib/task_queue';
import { isImage } from '$lib/image_utils';

type VideoId = string;

export type VideoMetadata = {
  videoId: string;
  videoPath: string;
  duration: number;
};

export type VideoRef = {
  videoId: VideoId;
  videoPath: string;
};

export class VideoResolver {
  private taskQueue = new TaskQueue();
  private videos = new Map<VideoId, VideoMetadata>();

  async loadMetadata(refs: VideoRef[]) {
    for (const ref of refs) {
      await this.loadMetadataOne(ref);
    }
  }

  getMetadata(id: VideoId): VideoMetadata {
    const video = this.videos.get(id);
    if (!video) {
      throw new Error(`Must preload metadata for video "${id}"`);
    }
    return video;
  }

  async loadMetadataOne(ref: VideoRef): Promise<VideoMetadata> {
    // Create one by one to speed up the process, video elements are struggling if it's done at the
    // same time
    return this.taskQueue.run(() => {
      return this.doLoadMetadataOne(ref);
    });
  }

  private async doLoadMetadataOne(ref: VideoRef): Promise<VideoMetadata> {
    const existingMetadata = this.videos.get(ref.videoId);
    if (existingMetadata) {
      return existingMetadata;
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

    this.videos.set(ref.videoId, metadata);

    video.removeAttribute('src');
    video.load();

    return metadata;
  }
}
