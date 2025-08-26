import { Deferred } from './deferred';

type AudioId = string;

type AudioMetadata = {
	audioId: string;
	audioPath: string;
	duration: number;
};

type AudioRef = {
	audioId: AudioId;
	audioPath: string;
};

export class AudioResolver {
	private audios = new Map<AudioId, AudioMetadata>();

	async loadMetadata(refs: AudioRef[]) {
		for (const ref of refs) {
			await this.loadMetadataOne(ref);
		}
	}

	getMetadata(id: AudioId): AudioMetadata {
		if (!this.audios.has(id)) {
			throw new Error(`Must preload metadata for audio "${id}"`);
		}
		return this.audios.get(id);
	}

	getAudioElement(ref: AudioRef): HTMLAudioElement {
		const audio = document.createElement('audio');
		audio.src = ref.audioPath;
		return audio;
	}

	private async loadMetadataOne(ref: AudioRef): Promise<AudioMetadata> {
		const existingMetadata = this.audios.get(ref.audioId);
		if (existingMetadata) {
			return existingMetadata;
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
			{ once: true }
		);

		await loadedMetadata.promise;

		const metadata: AudioMetadata = {
			audioId: ref.audioId,
			audioPath: ref.audioPath,
			duration: audio.duration
		};

		this.audios.set(ref.audioId, metadata);

		audio.removeAttribute('src');
		audio.load();

		return metadata;
	}
}
