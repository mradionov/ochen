import { Deferred } from '../../../src2/lib/deferred';
import { TaskQueue } from '$lib/task_queue';
import { isImage } from '$lib/image_utils';

type ImageId = string;

export type ImageMetadata = {
  imageId: string;
  imagePath: string;
};

export type ImageRef = {
  imageId: ImageId;
  imagePath: string;
};

export class ImageResolver {
  private taskQueue = new TaskQueue();
  private images = new Map<ImageId, ImageMetadata>();

  async loadMetadata(refs: ImageRef[]) {
    for (const ref of refs) {
      await this.loadMetadataOne(ref);
    }
  }

  getMetadata(id: ImageId): ImageMetadata {
    const video = this.images.get(id);
    if (!video) {
      throw new Error(`Must preload metadata for image "${id}"`);
    }
    return video;
  }

  async loadMetadataOne(ref: ImageRef): Promise<ImageMetadata> {
    // Create one by one to speed up the process, video elements are struggling if it's done at the
    // same time
    return this.taskQueue.run(() => {
      return this.doLoadMetadataOne(ref);
    });
  }

  private async doLoadMetadataOne(ref: ImageRef): Promise<ImageMetadata> {
    const existingMetadata = this.images.get(ref.imageId);
    if (existingMetadata) {
      return existingMetadata;
    }

    const loadedMetadata = new Deferred<void>();

    const video = new Image();
    video.src = ref.imagePath;
    video.addEventListener(
      'load',
      () => {
        loadedMetadata.resolve();
      },
      { once: true },
    );

    await loadedMetadata.promise;

    const metadata: ImageMetadata = {
      imageId: ref.imageId,
      imagePath: ref.imagePath,
    };

    this.images.set(ref.imageId, metadata);

    return metadata;
  }
}
