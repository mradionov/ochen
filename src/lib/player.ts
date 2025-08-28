import { defaults } from '$lib/defaults.ts';
import type { TransitionOut } from '@/manifest.ts';
import type { Renderer } from './renderer.ts';

const DEFAULT_OPTIONS: PlayerOptions = {
	rate: 1,
	loop: false,
	transitionOut: undefined,
	onTransitionOutStart: undefined,
	onEnded: undefined
};

type PlayerOptions = {
	rate: number;
	loop: boolean;
	transitionOut?: TransitionOut;
	onTransitionOutStart?: () => void;
	onEnded?: () => void;
};

export class Player {
	readonly options: PlayerOptions;
	readonly $video: HTMLVideoElement;

	private hasTransitionOurStarted = false;
	private isPlaying = false;
	private isDestroyed = false;

	constructor(
		private readonly path: string,
		readonly renderer: Renderer,
		argOptions = {}
	) {
		this.options = defaults(DEFAULT_OPTIONS, argOptions);

		this.$video = document.createElement('video');

		this.loadVideo();
	}

	update() {
		if (this.isPlaying) {
			this.drawFrame();
		}
	}

	private get rate() {
		return this.options.rate ?? 1;
	}

	async play() {
		if (this.isDestroyed) {
			this.loadVideo();
			this.isDestroyed = false;
		}
		await this.$video.play();
		this.isPlaying = true;
	}

	async pause() {
		await this.$video.pause();
		this.isPlaying = false;

		this.destroy();
	}

	async togglePlay() {
		if (this.isPlaying) {
			await this.pause();
		} else {
			await this.play();
		}
	}

	seek(time: number) {
		this.$video.currentTime = time * this.rate;
	}

	async showPoster() {
		await this.$video.play();
		await this.$video.pause();
		this.drawFrame();
	}

	destroy() {
		this.isDestroyed = true;
		this.destroyVideo();
	}

	async changeTintColor(newTintColor) {
		this.renderer.setTintColor(newTintColor);
		this.loadVideo();
		await this.showPoster();
		this.destroy();
	}

	drawFrame() {
		this.renderer.updateFrame(this.$video);
	}

	loadVideo() {
		this.$video.muted = true;
		this.$video.src = this.path;
		this.$video.playbackRate = this.options.rate;
		this.$video.loop = this.options.loop;
		this.$video.addEventListener('timeupdate', this.onVideoTime);
		this.$video.addEventListener('ended', this.onVideoEnded);
	}

	destroyVideo() {
		this.$video.removeAttribute('src'); // empty source
		this.$video.load();
		this.$video.removeEventListener('timeupdate', this.onVideoTime);
		this.$video.removeEventListener('ended', this.onVideoEnded);
		this.hasTransitionOurStarted = false;
	}

	private onVideoTime = () => {
		if (!this.options.transitionOut) {
			return;
		}
		const { $canvas } = this.renderer;
		const { duration, kind } = this.options.transitionOut;
		const startSec = this.$video.duration - duration;
		if (this.$video.currentTime > startSec && !this.hasTransitionOurStarted) {
			this.hasTransitionOurStarted = true;
			this.options?.onTransitionOutStart();
			switch (kind) {
				case 'fade':
					$canvas.classList.add('transition-out-fade');
					$canvas.style.animationDuration = `${duration / this.options.rate}s`;
					break;
				case 'cut':
				default:
					$canvas.classList.add('transition-out-cut');
			}
		} else if (this.$video.currentTime < startSec && this.hasTransitionOurStarted) {
			this.hasTransitionOurStarted = false;
		}
	};

	private onVideoEnded = () => {
		this.options.onEnded?.();
	};
}
