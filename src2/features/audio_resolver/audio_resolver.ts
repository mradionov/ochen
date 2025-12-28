import { Deferred } from '../../lib/deferred';
import type { AudioId } from '../manifest/manifest_schema';
import type { AudioMetadata, AudioResolverStore } from './audio_resolver_store';

type AudioRef = {
  audioId: AudioId;
  audioPath: string;
};

export class AudioResolver {
  private readonly audioResolverStore: AudioResolverStore;

  constructor(audioResolverStore: AudioResolverStore) {
    this.audioResolverStore = audioResolverStore;
  }

  async loadMetadata(refs: AudioRef[]) {
    for (const ref of refs) {
      await this.loadMetadataOne(ref);
    }
  }

  createAudioElement(ref: AudioRef): HTMLAudioElement {
    const element = document.createElement('audio');
    element.src = ref.audioPath;
    return element;
  }

  private async loadMetadataOne(ref: AudioRef): Promise<void> {
    if (this.audioResolverStore.hasMetadata(ref.audioId)) {
      return;
    }

    const loadedMetadata = new Deferred<void>();

    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.src = ref.audioPath;
    audio.addEventListener(
      'loadedmetadata',
      () => {
        loadedMetadata.resolve();
      },
      { once: true },
    );

    await loadedMetadata.promise;

    const metadata: AudioMetadata = {
      audioId: ref.audioId,
      audioPath: ref.audioPath,
      duration: audio.duration,
    };

    this.audioResolverStore.addMetadata(ref.audioId, metadata);

    audio.removeAttribute('src');
    audio.load();
  }
}
