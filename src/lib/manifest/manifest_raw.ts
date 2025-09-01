// Original JSON format
export type ManifestRaw = {
	videoTrack: VideoTrackRaw;
	audioTrack: AudioTrackRaw;
};

type VideoId = string;

export type VideoTrackRaw = {
	transitionOut?: VideoTransitionOutRaw;
	effects?: VideoEffectsRaw;
	clips: VideoClipRaw[];
	videos: Record<string, string>;
};

type VideoEffectsRaw = {
	tint?: string;
	vignette?: boolean;
	grain?: number;
	blur?: number;
};

type VideoTransitionOutRaw = {
	duration?: number;
	kind?: 'cut' | 'fade';
};

type VideoClipRaw = {
	videoId: VideoId;
	rate?: number;
	offsetX?: number | string;
	offsetY?: number | string;
};

type AudioId = string;

type AudioClipRaw = {
	audioId: AudioId;
};

export type AudioTrackRaw = {
	clips: AudioClipRaw[];
	audios: Record<string, string>;
};
