import type { AudioResolver } from '$lib/audio/audio_resolver';
import type { AudioTimeline } from '$lib/audio/audio_timeline';
import { AudioPlayer } from '$lib/audio/audio_player';

export class AudioProducer {
	private currentIndex = 0;
	private currentPlayer: AudioPlayer | undefined;
	private isPlaying = false;

	constructor(
		private readonly audioTimeline: AudioTimeline,
		private readonly audioResolver: AudioResolver
	) {}

	load() {
		this.ensurePlayer();
	}

	play() {
		if (this.isPlaying) {
			return;
		}
		this.isPlaying = true;
		this.ensurePlayer();
		this.currentPlayer?.play();
	}

	pause() {
		if (!this.isPlaying) {
			return;
		}
		this.isPlaying = false;
		this.ensurePlayer();
		this.currentPlayer?.pause();
	}

	seek(time: number) {
		const newTimelineClip = this.audioTimeline.findClipByTime(time);
		if (!newTimelineClip) {
			console.warn(`No audio clip for time "${time}"`);
			return;
		}

		const inClipTime = time - newTimelineClip.start;

		// Same clip
		if (this.currentIndex === newTimelineClip.index) {
			// Seek current clip
			this.ensurePlayer(inClipTime);
			return;
		}

		const wasPlaying = this.isPlaying;
		if (wasPlaying) {
			this.pause();
		}

		this.currentIndex = newTimelineClip.index;
		this.ensurePlayer(inClipTime);

		if (wasPlaying) {
			this.play();
		}
	}

	private ensurePlayer(inClipTime?: number) {
		const currentClip = this.audioTimeline.clips[this.currentIndex];
		if (!this.currentPlayer) {
			this.currentPlayer = AudioPlayer.create(currentClip, this.audioResolver);
		}
		if (inClipTime != null) {
			this.currentPlayer?.seek(inClipTime);
		}
	}
}
