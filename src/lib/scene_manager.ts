import { Player } from './player.js';
import { createRenderer } from './renderer.ts';
import type { Manifest, Scene } from './manifest.ts';

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

	private createPlayerForScene(scene: Scene, sceneIndex: number) {
		const isLast = this.isLastScene(sceneIndex);

		const renderer = createRenderer({
			// width: 1080,
			// height: 1080,
			width: 800,
			height: 800,
			effects: this.manifest.effects,
			offsetX: scene.offsetX,
			offsetY: scene.offsetY
		});

		return new Player(scene.videoPath, renderer, {
			transitionOut: !isLast ? this.manifest.transitionOut : undefined,
			loop: isLast,
			rate: scene.rate,
			onTransitionOutStart: () => {
				void this.nextPlayer?.play();
			},
			onEnded: () => {
				this.incrementScene();
			}
		});
	}

	resetPlayers() {
		const oldPlayer = this.currentPlayer;

		if (this.nextPlayer) {
			this.currentPlayer = this.nextPlayer;
		} else {
			const currentScene = this.getCurrentScene();
			if (currentScene) {
				this.currentPlayer = this.createPlayerForScene(
					this.getCurrentScene(),
					this.getCurrentSceneIndex()
				);
				this.contentElement.appendChild(this.currentPlayer.renderer.$canvas);
			} else {
				this.currentPlayer = undefined;
			}
		}

		const nextScene = this.getNextScene();
		if (nextScene) {
			this.nextPlayer = this.createPlayerForScene(nextScene, this.getNextSceneIndex());
			this.contentElement.appendChild(this.nextPlayer.renderer.$canvas);
			void this.nextPlayer.showPoster();
		} else {
			this.nextPlayer = undefined;
		}

		if (oldPlayer && !this.isLastScene(this.getCurrentSceneIndex())) {
			oldPlayer.destroy();
			this.contentElement.removeChild(oldPlayer.renderer.$canvas);
		}

		void this.currentPlayer?.play();
	}

	private incrementScene() {
		this.currentIndex += 1;
		this.resetPlayers();
	}

	private getCurrentSceneIndex() {
		return this.currentIndex;
	}

	private getNextSceneIndex() {
		return this.currentIndex + 1;
	}

	private getCurrentScene() {
		return this.manifest.scenes[this.getCurrentSceneIndex()];
	}

	private getNextScene() {
		return this.manifest.scenes[this.getNextSceneIndex()];
	}

	private isLastScene(index: number) {
		return index >= this.manifest.scenes.length - 1;
	}
}
