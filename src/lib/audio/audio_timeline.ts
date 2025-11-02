import type { AudioResolver } from '$lib/audio/audio_resolver';
import type { Manifest, AudioClip } from '$lib/manifest/manifest.svelte';

type AudioId = string;

export type AudioTimelineClip = {
	audioId: AudioId;
	index: number;
	clip: AudioClip;
	start: number;
	end: number;
	duration: number;
};

export class AudioTimeline {
	constructor(
		private readonly manifest: Manifest,
		private readonly audioResolver: AudioResolver
	) {}

	get clips() {
		return this.manifest.audioTrack.clips;
	}

	findClipByTime(time: number): AudioTimelineClip | undefined {
		return this.getTimelineClips().find((timelineClip) => {
			return time >= timelineClip.start && time < timelineClip.end;
		});
	}

	getTimelineClips(): AudioTimelineClip[] {
		return this.clips.map((clip) => this.getTimelineClip(clip.audioId));
	}

	getClip(id: AudioId): AudioClip | undefined {
		return this.clips.find((clip) => clip.audioId === id);
	}

	getTimelineClip(id: AudioId): AudioTimelineClip {
		return {
			audioId: id,
			index: this.getClipIndex(id),
			clip: this.getClip(id),
			duration: this.getClipDuration(id),
			start: this.getClipStart(id),
			end: this.getClipEnd(id)
		};
	}

	getClipIndex(id: AudioId): number {
		return this.clips.findIndex((clip) => clip.audioId === id);
	}

	getClipStart(id: AudioId): number {
		let duration = 0;
		for (const clip of this.clips) {
			if (clip.audioId === id) {
				break;
			}
			duration += this.getClipDuration(clip.audioId);
		}
		return duration;
	}

	getClipEnd(id: AudioId): number {
		const start = this.getClipStart(id);
		const duration = this.getClipDuration(id);
		return start + duration;
	}

	getClipDuration(id: AudioId): number {
		const metadata = this.audioResolver.getMetadata(id);
		return metadata.duration;
	}

	getTotalDuration(): number {
		return this.clips
			.map((clip) => this.getClipDuration(clip.audioId))
			.reduce((duration, totalDuration) => {
				return totalDuration + duration;
			}, 0);
	}
}
