import { Player } from './player.js';
import { createRenderer } from './renderer.ts';
import type { Manifest, VideoClip } from './manifest.ts';

// TODO: rename
export class SceneManager {
	private currentIndex = 0;
	private currentPlayer: Player | undefined;
	private nextPlayer: Player | undefined;

	constructor(
		private readonly manifest: Manifest,
		private readonly contentElement: HTMLElement
	) {}

	update({ deltaTime }: { deltaTime: number }) {
		this.currentPlayer?.update({ deltaTime });
		// this.nextPlayer?.update({deltaTime});
	}

	private createPlayerForClip(clip: VideoClip, clipIndex: number) {
		const isLast = this.isLastClip(clipIndex);

		const renderer = createRenderer({
			// width: 1080,
			// height: 1080,
			width: 800,
			height: 800,
			effects: this.manifest.videoTrack.effects,
			offsetX: clip.offsetX,
			offsetY: clip.offsetY
		});

		return new Player(clip.videoPath, renderer, {
			transitionOut: !isLast ? this.manifest.videoTrack.transitionOut : undefined,
			loop: isLast,
			rate: clip.rate,
			onTransitionOutStart: () => {
				void this.nextPlayer?.play();
			},
			onEnded: () => {
				this.incrementClip();
			}
		});
	}

	resetPlayers() {
		const oldPlayer = this.currentPlayer;

		if (this.nextPlayer) {
			this.currentPlayer = this.nextPlayer;
		} else {
			const currentClip = this.getCurrentClip();
			if (currentClip) {
				this.currentPlayer = this.createPlayerForClip(
					this.getCurrentClip(),
					this.getCurrentClipIndex()
				);
				this.contentElement.appendChild(this.currentPlayer.renderer.$canvas);
			} else {
				this.currentPlayer = undefined;
			}
		}

		const nextClip = this.getNextClip();
		if (nextClip) {
			this.nextPlayer = this.createPlayerForClip(nextClip, this.getNextClipIndex());
			this.contentElement.appendChild(this.nextPlayer.renderer.$canvas);
			void this.nextPlayer.showPoster();
		} else {
			this.nextPlayer = undefined;
		}

		if (oldPlayer && !this.isLastClip(this.getCurrentClipIndex())) {
			oldPlayer.destroy();
			this.contentElement.removeChild(oldPlayer.renderer.$canvas);
		}

		void this.currentPlayer?.play();
	}

	private incrementClip() {
		this.currentIndex += 1;
		this.resetPlayers();
	}

	private getCurrentClipIndex() {
		return this.currentIndex;
	}

	private getNextClipIndex() {
		return this.currentIndex + 1;
	}

	private getCurrentClip() {
		return this.manifest.videoTrack.clips[this.getCurrentClipIndex()];
	}

	private getNextClip() {
		return this.manifest.videoTrack.clips[this.getNextClipIndex()];
	}

	private isLastClip(index: number) {
		return index >= this.manifest.videoTrack.clips.length - 1;
	}
}
