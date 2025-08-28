import type { AudioResolver } from '$lib/audio_resolver';
import type { AudioClip } from '$lib/manifest';

export class AudioPlayer {
	constructor(private readonly element: HTMLAudioElement) {}

	static create(clip: AudioClip, audioResolver: AudioResolver) {
		const element = audioResolver.createAudioElement(clip);
		return new AudioPlayer(element);
	}

	play() {
		void this.element.play();
	}

	pause() {
		this.element.pause();
	}

	seek(time: number) {
		this.element.currentTime = time;
	}
}
