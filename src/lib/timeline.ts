import type { Manifest, Scene } from '@/manifest.ts';
import type { VideoResolver } from '@/video_resolver.ts';

type VideoId = string;

export type SceneInTimeline = {
	id: VideoId;
	start: number;
	end: number;
	duration: number;
	rate: number;
};

export class Timeline {
	constructor(
		private readonly manifest: Manifest,
		private readonly videoResolver: VideoResolver
	) {}

	private get scenes() {
		return this.manifest.scenes;
	}

	getScene(videoId: VideoId): Scene {
		return this.scenes.find((scene) => scene.videoId === videoId);
	}

	getSceneInTimeline(videoId: VideoId): SceneInTimeline {
		return {
			videoId,
			duration: this.getSceneDuration(videoId),
			rate: this.getSceneRate(videoId),
			start: this.getSceneStart(videoId),
			end: this.getSceneEnd(videoId)
		};
	}

	getSceneStart(videoId: VideoId): number {
		let duration = 0;
		for (const scene of this.scenes) {
			if (scene.videoId === videoId) {
				break;
			}
			duration += this.getSceneDuration(scene.videoId);
		}
		return duration;
	}

	getSceneEnd(videoId: VideoId): number {
		const start = this.getSceneStart(videoId);
		const duration = this.getSceneDuration(videoId);
		return start + duration;
	}

	getSceneDuration(videoId: VideoId): number {
		const videoMetadata = this.videoResolver.getMetadata(videoId);
		const duration = videoMetadata.duration;
		const rate = this.getSceneRate(videoId);
		const ratedDuration = duration / rate;
		return ratedDuration;
	}

	getSceneRate(videoId: VideoId): number {
		const scene = this.getScene(videoId);
		return scene.rate ?? 1;
	}

	getTotalDuration(): number {
		return this.scenes
			.map((scene) => this.getSceneDuration(scene.videoId))
			.reduce((sceneDuration, totalDuration) => {
				return totalDuration + sceneDuration;
			}, 0);
	}
}
