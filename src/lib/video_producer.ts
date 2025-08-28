import type { VideoTimeline } from '$lib/video_timeline';
import type { VideoResolver } from '$lib/video_resolver';
import { VideoPlayer } from '$lib/video_player';
import { Subject } from '$lib/subject';

export class VideoProducer {
	private currentIndex: number | undefined;
	private currentPlayer: VideoPlayer | undefined;
	private isPlaying = false;

	readonly playerChanged = new Subject<{ player: VideoPlayer }>();

	constructor(
		private readonly videoTimeline: VideoTimeline,
		private readonly videoResolver: VideoResolver
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
		const newTimelineClip = this.videoTimeline.findClipByTime(time);
		if (!newTimelineClip) {
			throw new Error(`No video clip for time "${time}"`);
		}

		const inClipTime = time - newTimelineClip.start;

		if (this.currentIndex === newTimelineClip.index) {
			this.ensurePlayer({ inClipTime });
			return;
		}

		const wasPlaying = this.isPlaying;
		if (wasPlaying) {
			this.pause();
		}

		this.ensurePlayer({ newIndex: newTimelineClip.index, inClipTime });

		if (wasPlaying) {
			this.play();
		}
	}

	private ensurePlayer({ newIndex, inClipTime }: { newIndex?: number; inClipTime?: number } = {}) {
		const isNew = this.currentIndex == null || (newIndex != null && this.currentIndex !== newIndex);
		if (isNew) {
			if (this.currentPlayer) {
				this.currentPlayer.destroy();
				this.currentPlayer = undefined;
			}
			const index = this.currentIndex == null ? 0 : newIndex;
			const newClip = this.videoTimeline.clips[index];
			if (!newClip) {
				throw new Error('No new clip');
			}
			this.currentPlayer = VideoPlayer.create(newClip, this.videoResolver);
			this.currentPlayer.ended.addListener(this.onPlayerEnded);
			this.currentIndex = index;
			this.playerChanged.emit({ player: this.currentPlayer });
		}

		if (inClipTime != null) {
			this.currentPlayer?.seek(inClipTime);
		}
	}

	private onPlayerEnded = () => {
		if (!this.currentIndex) {
			throw new Error('A player must already exist');
		}
		const newIndex = this.currentIndex + 1;

		const wasPlaying = this.isPlaying;
		if (wasPlaying) {
			this.pause();
		}

		this.ensurePlayer({ newIndex });

		if (wasPlaying) {
			this.play();
		}
	};
}
