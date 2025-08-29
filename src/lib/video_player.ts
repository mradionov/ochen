import type { VideoClip } from '$lib/manifest';
import type { VideoResolver } from '$lib/video_resolver';
import { Subject } from '$lib/subject';

export class VideoPlayer {
	readonly ended = new Subject<void>();
	private _isPlaying = false;

	private constructor(
		readonly element: HTMLVideoElement,
		readonly clip: VideoClip
	) {
		element.addEventListener('ended', this.onElementEnded);
	}

	static create(clip: VideoClip, videoResolver: VideoResolver) {
		const element = videoResolver.createVideoElement(clip);
		element.playbackRate = clip.rate ?? 1;
		element.muted = true;
		return new VideoPlayer(element, clip);
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

	destroy() {
		this.element.removeAttribute('src'); // empty source
		this.element.load();
		this.element.removeEventListener('ended', this.onElementEnded);
		this._isPlaying = false;
	}

	private get rate() {
		return this.clip.rate ?? 1;
	}

	private onElementEnded = () => {
		this.ended.emit();
		this._isPlaying = false;
	};
}
