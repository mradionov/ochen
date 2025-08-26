import type { AudioResolver } from '$lib/audio_resolver';
import type { AudioTimeline } from '$lib/audio_timeline';

export class AudioProducer {
	constructor(
		private readonly audioTimeline: AudioTimeline,
		private readonly audioResolver: AudioResolver
	) {}

	async play() {
		const timelineClip = this.audioTimeline.getTimelineClips()[0];
		const audioElement = this.audioResolver.getAudioElement(timelineClip.clip);
		await audioElement.play();
	}
}
