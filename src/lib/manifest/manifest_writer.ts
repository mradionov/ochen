import type { Manifest } from '$lib/manifest/manifest';
import type { ManifestRaw } from '$lib/manifest/manifest_raw';

export class ManifestWriter {
	async writeWithFilePicker(manifest: Manifest) {
		const manifestRaw = this.serialize(manifest);
		const manifestJson = JSON.stringify(manifestRaw, null, 2);

		const fileName = `manifest.json`;

		const handle = await window.showSaveFilePicker({
			suggestedName: fileName,
			types: [
				{
					description: 'JSON Files',
					accept: { 'application/json': ['.json'] }
				}
			]
		});

		const writable = await handle.createWritable();
		await writable.write(manifestJson);
		await writable.close();
	}

	private serialize(manifest: Manifest): ManifestRaw {
		return {
			videoTrack: {
				effects: manifest.videoTrack.effects,
				clips: manifest.videoTrack.clips.map((clip) => ({
					videoId: clip.videoId,
					rate: clip.rate,
					offsetX: clip.offsetX,
					offsetY: clip.offsetY
				})),
				videos: manifest.videoTrack.videos
			},
			audioTrack: {
				clips: manifest.audioTrack.clips.map((clip) => ({
					audioId: clip.audioId
				})),
				audios: manifest.audioTrack.audios
			}
		};
	}
}
