import { Deferred } from './deferred.ts';

type VideoId = string;

type VideoMetadata = {
	id: string;
	path: string;
	duration: number;
};

type VideoRef = {
	id: VideoId;
	path: string;
};

export class VideoResolver {
	private videos = new Map<VideoId, VideoMetadata>();

	async loadMetadata(refs: VideoRef[]) {
		for (const ref of refs) {
			await this.loadMetadataOne(ref);
		}
	}

	getMetadata(id: VideoId): VideoMetadata {
		if (!this.videos.has(id)) {
			throw new Error(`Must preload metadata for video "${id}"`);
		}
		return this.videos.get(id);
	}

	private async loadMetadataOne(ref: VideoRef): Promise<VideoMetadata> {
		const existingMetadata = this.videos.get(ref.id);
		if (existingMetadata) {
			return existingMetadata;
		}

		const loadedMetadata = new Deferred<void>();

		const video = document.createElement('video');
		video.preload = 'metadata';
		video.src = ref.path;
		video.addEventListener(
			'loadedmetadata',
			() => {
				loadedMetadata.resolve();
			},
			{ once: true }
		);

		await loadedMetadata.promise;

		const metadata: VideoMetadata = {
			id: ref.id,
			path: ref.path,
			duration: video.duration
		};

		this.videos.set(ref.id, metadata);

		video.removeAttribute('src');
		video.load();

		return metadata;
	}
}
