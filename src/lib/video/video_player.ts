import type { VideoResolver } from '$lib/video/video_resolver';
import { Subject } from '$lib/subject';
import type { VideoTimelineClip } from '$lib/video/video_timeline';

export class VideoPlayer {
	readonly ended = new Subject<void>();
	private _isPlaying = false;

	private constructor(
		readonly element: HTMLVideoElement,
		readonly timelineClip: VideoTimelineClip
	) {
		element.addEventListener('ended', this.onElementEnded);
	}

	static create(timelineClip: VideoTimelineClip, videoResolver: VideoResolver) {
		console.log('VideoPlayer.create', timelineClip);
		const element = videoResolver.createVideoElement(timelineClip.clip);
		element.playbackRate = timelineClip.rate;
		element.muted = true;
		return new VideoPlayer(element, timelineClip);
	}

	get isPlaying() {
		return this._isPlaying;
	}

	play() {
		if (this._isPlaying) {
			return;
		}
		this._isPlaying = true;
		void this.element.play();
	}

	pause() {
		if (!this._isPlaying) {
			return;
		}
		this._isPlaying = false;
		this.element.pause();
	}

	seek(time: number) {
		this.element.currentTime = time * this.rate;
	}

	updateFrame() {
		if (!this.isPlaying) return;

		if (this.element.currentTime > this.timelineClip.trimmedDuration) {
			this._isPlaying = false;
			this.ended.emit();
			this.destroy();
		}
	}

	destroy() {
		this.element.removeAttribute('src'); // empty source
		this.element.load();
		this.element.removeEventListener('ended', this.onElementEnded);
		this.ended.removeAllListeners();
		this._isPlaying = false;
	}

	private get rate() {
		return this.timelineClip.rate;
	}

	private onElementEnded = () => {
		this.ended.emit();
		this._isPlaying = false;
	};
}
