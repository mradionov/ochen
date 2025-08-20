import type { Manifest, VideoClip } from '@/manifest.ts';
import type { VideoResolver } from '@/video_resolver.ts';

type VideoId = string;

export type VideoTimelineClip = {
	videoId: VideoId;
	clip: VideoClip;
	start: number;
	end: number;
	duration: number;
	rate: number;
};

export class VideoTimeline {
	constructor(
		private readonly manifest: Manifest,
		private readonly videoResolver: VideoResolver
	) {}

	private get clips() {
		return this.manifest.videoTrack.clips;
	}

	getTimelineClips() {
		return this.clips.map((clip) => this.getTimelineClip(clip.videoId));
	}

	getClip(id: VideoId): VideoClip {
		return this.clips.find((clip) => clip.videoId === id);
	}

	getTimelineClip(id: VideoId): VideoTimelineClip {
		return {
			videoId: id,
			clip: this.getClip(id),
			duration: this.getClipDuration(id),
			rate: this.getClipRate(id),
			start: this.getClipStart(id),
			end: this.getClipEnd(id)
		};
	}

	getClipStart(id: VideoId): number {
		let duration = 0;
		for (const clip of this.clips) {
			if (clip.videoId === id) {
				break;
			}
			duration += this.getClipDuration(clip.videoId);
		}
		return duration;
	}

	getClipEnd(id: VideoId): number {
		const start = this.getClipStart(id);
		const duration = this.getClipDuration(id);
		return start + duration;
	}

	getClipDuration(id: VideoId): number {
		const videoMetadata = this.videoResolver.getMetadata(id);
		const duration = videoMetadata.duration;
		const rate = this.getClipRate(id);
		const ratedDuration = duration / rate;
		return ratedDuration;
	}

	getClipRate(id: VideoId): number {
		return this.getClip(id).rate ?? 1;
	}

	getTotalDuration(): number {
		return this.clips
			.map((clip) => this.getClipDuration(clip.videoId))
			.reduce((duration, totalDuration) => {
				return totalDuration + duration;
			}, 0);
	}
}
