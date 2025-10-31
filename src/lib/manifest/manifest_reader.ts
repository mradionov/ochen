import { Manifest, VideoTrack, VideoClip, AudioTrack, AudioClip } from './manifest';
import type { VideoTransitionOut } from './manifest';
import type { ManifestRaw } from '$lib/manifest/manifest_raw';

type VideoId = string;
type AudioId = string;

export class ManifestReader {
	async read(projectName: string): Promise<Manifest> {
		const res = await fetch(`/sets/${projectName}/manifest.json`);
		const manifestRaw: ManifestRaw = await res.json();
		return this.parse(projectName, manifestRaw);
	}

	private parse(projectName: string, manifestRaw: ManifestRaw): Manifest {
		const videoTrack = this.parseVideoTrack(projectName, manifestRaw);
		const audioTrack = this.parseAudioTrack(projectName, manifestRaw);
		return new Manifest(projectName, videoTrack, audioTrack);
	}

	private parseVideoTrack(projectName: string, manifest: ManifestRaw): VideoTrack {
		const videoTrackRaw = manifest.videoTrack ?? {};
		const effectsRaw = videoTrackRaw.effects;
		const transitionOutRaw = videoTrackRaw.transitionOut;
		const videoClipsRaw = videoTrackRaw.clips ?? [];
		const videoMap = this.parseVideoMap(projectName, manifest);

		const transitionOut: VideoTransitionOut = {
			duration: transitionOutRaw?.duration ?? 0,
			kind: transitionOutRaw?.kind ?? 'cut'
		};

		const videoIdSet = new Set<VideoId>();
		const clips = videoClipsRaw.map((clipRaw) => {
			const { videoId, offsetX, offsetY, rate, trimEnd } = clipRaw;

			if (videoIdSet.has(videoId)) {
				console.log(`Duplicate video id: "${videoId}"`);
			}
			videoIdSet.add(videoId);

			const videoPath = videoMap.get(videoId);
			if (!videoPath) {
				throw new Error(`No video found for "${videoId}"`);
			}

			return new VideoClip(
				videoId,
				videoPath,
				offsetX,
				offsetY,
				rate,
				trimEnd,
				transitionOut,
				effectsRaw
			);
		});

		const unusedVideoIdSet = new Set<VideoId>();
		videoMap.keys().forEach((videoId) => {
			if (!videoIdSet.has(videoId)) {
				unusedVideoIdSet.add(videoId);
			}
		});

		return new VideoTrack(clips, videoTrackRaw.videos ?? {}, transitionOut, effectsRaw);
	}

	private parseVideoMap(projectName: string, manifest: ManifestRaw): ReadonlyMap<VideoId, string> {
		const videos = manifest.videoTrack?.videos ?? {};

		const videoMap = new Map<VideoId, string>();
		const basePath = `/sets/${projectName}/videos`;

		Object.keys(videos).forEach((name) => {
			const fileName = videos[name];
			const filePath = `${basePath}/${fileName}`;
			videoMap.set(name, filePath);
		});

		return videoMap;
	}

	private parseAudioTrack(projectName: string, manifest: ManifestRaw): AudioTrack {
		const audioTrackRaw = manifest.audioTrack ?? {};
		const audioClipsRaw = audioTrackRaw.clips ?? [];
		const audioMap = this.parseAudioMap(projectName, manifest);

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

		return new AudioTrack(clips, audioTrackRaw?.audios ?? {});
	}

	private parseAudioMap(projectName: string, manifest: ManifestRaw): ReadonlyMap<string, string> {
		const audios = manifest.audioTrack?.audios ?? {};

		const audioMap = new Map<AudioId, string>();
		const basePath = `/sets/${projectName}/audios`;

		Object.keys(audios).forEach((name) => {
			const fileName = audios[name];
			const filePath = `${basePath}/${fileName}`;
			audioMap.set(name, filePath);
		});

		return audioMap;
	}
}
