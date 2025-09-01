import { Manifest, VideoTrack, VideoClip, AudioTrack, AudioClip } from './manifest';
import type { ManifestRaw } from '$lib/manifest/manifest_raw';

type VideoId = string;
type AudioId = string;

export class ManifestReader {
	async read(setId: string): Promise<Manifest> {
		const res = await fetch(`/sets/${setId}/manifest.json`);
		const manifestRaw: ManifestRaw = await res.json();
		return this.parse(setId, manifestRaw);
	}

	private parse(setId: string, manifestRaw: ManifestRaw): Manifest {
		const videoTrack = this.parseVideoTrack(setId, manifestRaw);
		const audioTrack = this.parseAudioTrack(setId, manifestRaw);
		return new Manifest(setId, videoTrack, audioTrack);
	}

	private parseVideoTrack(setId: string, manifest: ManifestRaw): VideoTrack {
		const videoTrackRaw = manifest.videoTrack;
		const { effects, transitionOut } = videoTrackRaw;
		const videoClipsRaw = videoTrackRaw.clips ?? [];
		const videoMap = this.parseVideoMap(setId, manifest);

		const videoIdSet = new Set<VideoId>();
		const clips = videoClipsRaw.map((clipRaw) => {
			const { videoId, offsetX, offsetY, rate } = clipRaw;

			if (videoIdSet.has(videoId)) {
				console.log(`Duplicate video id: "${videoId}"`);
			}
			videoIdSet.add(videoId);

			const videoPath = videoMap.get(videoId);
			if (!videoPath) {
				throw new Error(`No video found for "${videoId}"`);
			}

			return new VideoClip(videoId, videoPath, offsetX, offsetY, rate, effects);
		});

		const unusedVideoIdSet = new Set<VideoId>();
		videoMap.keys().forEach((videoId) => {
			if (!videoIdSet.has(videoId)) {
				unusedVideoIdSet.add(videoId);
			}
		});

		return new VideoTrack(clips, manifest.videoTrack.videos, effects);
	}

	private parseVideoMap(setId: string, manifest: ManifestRaw): ReadonlyMap<VideoId, string> {
		const videos = manifest.videoTrack.videos ?? {};

		const videoMap = new Map<VideoId, string>();
		const basePath = `/sets/${setId}/videos`;

		Object.keys(videos).forEach((name) => {
			const fileName = videos[name];
			const filePath = `${basePath}/${fileName}`;
			videoMap.set(name, filePath);
		});

		return videoMap;
	}

	private parseAudioTrack(setId: string, manifest: ManifestRaw): AudioTrack {
		const audioTrackRaw = manifest.audioTrack ?? {};
		const audioClipsRaw = audioTrackRaw.clips ?? [];
		const audioMap = this.parseAudioMap(setId, manifest);

		const audioIdSet = new Set<AudioId>();
		const clips = audioClipsRaw.map((clipRaw) => {
			const { audioId } = clipRaw;

			if (audioIdSet.has(audioId)) {
				console.log(`Duplicate audio id: "${audioId}"`);
			}
			audioIdSet.add(audioId);

			const audioPath = audioMap.get(audioId);
			if (!audioPath) {
				throw new Error(`No audio found for "${audioId}"`);
			}

			return new AudioClip(audioId, audioPath);
		});

		return new AudioTrack(clips, manifest.audioTrack.audios);
	}

	private parseAudioMap(setId: string, manifest: ManifestRaw): ReadonlyMap<string, string> {
		const audios = manifest.audioTrack.audios ?? {};

		const audioMap = new Map<AudioId, string>();
		const basePath = `/sets/${setId}/audios`;

		Object.keys(audios).forEach((name) => {
			const fileName = audios[name];
			const filePath = `${basePath}/${fileName}`;
			audioMap.set(name, filePath);
		});

		return audioMap;
	}
}
