import type { Scene } from './manifest.ts';
import { createRenderer } from './renderer.ts';
import { Player } from './player.ts';
import { TaskQueue } from './task_queue.ts';

export class PlayerFactory {
	private taskQueue = new TaskQueue();

	async createForPreview(scene: Scene): Promise<Player> {
		// Create one by one to speed up the process, video elements are struggling if it's done at the same time
		return this.taskQueue.run(async () => {
			const renderer = createRenderer({
				width: 200,
				height: 200,
				effects: scene.effects,
				offsetX: scene.offsetX,
				offsetY: scene.offsetY
			});

			const previewRate = 10;

			const player = new Player(scene.videoPath, renderer, {
				width: 200,
				height: 200,
				rate: previewRate
			});

			await player.showPoster();

			// Free up video resources for next players, as they only need canvases with posters
			player.destroy();

			return player;
		});
	}
}
