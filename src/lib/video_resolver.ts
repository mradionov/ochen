import { Deferred } from './deferred.ts';

type VideoId = string;

type VideoMetadata = {
	videoId: string;
	videoPath: string;
	duration: number;
};

type VideoRef = {
	videoId: VideoId;
	videoPath: string;
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

	createVideoElement(ref: VideoRef): HTMLVideoElement {
		const element = document.createElement('video');
		element.src = ref.videoPath;
		return element;
	}

	private async loadMetadataOne(ref: VideoRef): Promise<VideoMetadata> {
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
			{ once: true }
		);

		await loadedMetadata.promise;

		const metadata: VideoMetadata = {
			videoId: ref.videoId,
			videoPath: ref.videoPath,
			duration: video.duration
		};

		this.videos.set(ref.videoId, metadata);

		video.removeAttribute('src');
		video.load();

		return metadata;
	}
}
