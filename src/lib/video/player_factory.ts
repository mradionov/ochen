import type { VideoClip } from '../manifest/manifest_reader.ts';
import { createRenderer } from './renderer.ts';
import { Player } from './player.ts';
import { TaskQueue } from '../task_queue.ts';

export class PlayerFactory {
	private taskQueue = new TaskQueue();

	async createForPreview(videoClip: VideoClip): Promise<Player> {
		// Create one by one to speed up the process, video elements are struggling if it's done at the same time
		return this.taskQueue.run(async () => {
			const renderer = createRenderer({
				width: 200,
				height: 200,
				effects: videoClip.effects,
				offsetX: videoClip.offsetX,
				offsetY: videoClip.offsetY
			});

			const previewRate = 10;

			const player = new Player(videoClip.videoPath, renderer, {
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
