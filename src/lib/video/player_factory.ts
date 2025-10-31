import { createRenderer } from './renderer';
import type { RendererOptions } from './renderer';
import { Player } from './player';
import { TaskQueue } from '../task_queue';

export class PlayerFactory {
	private taskQueue = new TaskQueue();

	async createForPreview(videoPath: string, rendererOptions?: RendererOptions): Promise<Player> {
		// Create one by one to speed up the process, video elements are struggling if it's done at the same time
		return this.taskQueue.run(async () => {
			const renderer = createRenderer({
				width: 200,
				height: 200,
				...rendererOptions
			});

			const previewRate = 10;

			const player = new Player(videoPath, renderer, {
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
