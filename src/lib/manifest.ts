// Transformed format
export type Manifest = {
	videoTrack: VideoTrack;
	audioTrack: AudioTrack;
};

export type VideoTrack = {
	effects?: VideoEffects;
	clips: VideoClip[];
};

export type VideoClip = VideoClipObj & {
	videoPath: string;
	effects?: VideoEffects;
	transitionOut?: VideoTransitionOut;
};

export type AudioTrack = {
	clips: AudioClip[];
};

export type AudioClip = AudioClipObj & { audioPath: string };

export type VideoEffects = VideoEffectsObj;
export type VideoTransitionOut = VideoTransitionOutObj;

// Original JSON format
type ManifestObj = {
	videoTrack: VideoTrackObj;
	audioTrack: AudioTrackObj;
};

type VideoTrackObj = {
	transitionOut?: VideoTransitionOutObj;
	effects?: VideoEffectsObj;
	clips: VideoClipObj[];
	videos: Record<string, string>;
};

type VideoEffectsObj = {
	tint?: string;
	vignette?: boolean;
	grain?: number;
	blur?: number;
};

type VideoTransitionOutObj = {
	duration?: number;
	kind?: 'cut' | 'fade';
};

type VideoClipObj = {
	videoId: VideoId;
	rate?: number;
	offsetX?: number | string;
	offsetY?: number | string;
};

type AudioTrackObj = {
	clips: AudioClipObj[];
	audios: Record<string, string>;
};

type AudioClipObj = {
	audioId: AudioId;
};

type VideoId = string;
type AudioId = string;

export async function fetchManifest(setId: string): Promise<Manifest> {
	const res = await fetch(`/sets/${setId}/manifest.json`);
	const manifest: ManifestObj = await res.json();

	const videoTrack = parseVideoTrack(setId, manifest);
	const audioTrack = parseAudioTrack(setId, manifest);

	return {
		videoTrack,
		audioTrack
	};
}

function parseVideoTrack(setId: string, manifest: ManifestObj): VideoTrack {
	const videoTrack = manifest.videoTrack;
	const { effects, transitionOut } = videoTrack;
	const videoClips = videoTrack.clips ?? [];
	const videoMap = parseVideoMap(setId, manifest);

	const videoIdSet = new Set<VideoId>();
	const clips = videoClips.map((clip) => {
		const { videoId, offsetX, offsetY, rate } = clip;

		if (videoIdSet.has(videoId)) {
			console.log(`Duplicate video id: "${videoId}"`);
		}
		videoIdSet.add(videoId);

		const videoPath = videoMap.get(videoId);
		if (!videoPath) {
			throw new Error(`No video found for "${videoId}"`);
		}

		return {
			videoId,
			videoPath,
			offsetX,
			offsetY,
			rate,
			effects
		};
	});

	return { effects, clips };
}

function parseVideoMap(setId: string, manifest: ManifestObj): ReadonlyMap<VideoId, string> {
	const videos = manifest.videoTrack?.videos ?? {};

	const videoMap = new Map<VideoId, string>();
	const basePath = `/sets/${setId}/videos`;

	Object.keys(videos).forEach((name) => {
		const fileName = videos[name];
		const filePath = `${basePath}/${fileName}`;
		videoMap.set(name, filePath);
	});

	return videoMap;
}

function parseAudioTrack(setId: string, manifest: ManifestObj): AudioTrack {
	const audioTrack = manifest.audioTrack ?? {};
	const audioClips = audioTrack.clips ?? [];
	const audioMap = parseAudioMap(setId, manifest);

	const audioIdSet = new Set<VideoId>();
	const clips = audioClips.map((clip) => {
		const { audioId } = clip;

		if (audioIdSet.has(audioId)) {
			console.log(`Duplicate audio id: "${audioId}"`);
		}
		audioIdSet.add(audioId);

		const audioPath = audioMap.get(audioId);
		if (!audioPath) {
			throw new Error(`No audio found for "${audioId}"`);
		}

		return {
			audioId,
			audioPath
		};
	});

	return { clips };
}

function parseAudioMap(setId: string, manifest: ManifestObj): ReadonlyMap<string, string> {
	const audios = manifest.audioTrack?.audios ?? {};

	const audioMap = new Map<string, string>();
	const basePath = `/sets/${setId}/audios`;

	Object.keys(audios).forEach((name) => {
		const fileName = audios[name];
		const filePath = `${basePath}/${fileName}`;
		audioMap.set(name, filePath);
	});

	return audioMap;
}
