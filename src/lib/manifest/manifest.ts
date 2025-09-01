type VideoId = string;
type VideoFilename = string;
type VideoFilepath = string;

type VideoEffects = {
	tint?: string;
	vignette?: boolean;
	grain?: number;
	blur?: number;
};

export class VideoTrack {
	constructor(
		readonly clips: VideoClip[],
		readonly videos: Record<VideoId, VideoFilename>,
		readonly effects: VideoEffects | undefined
	) {}
}

export class VideoClip {
	constructor(
		readonly videoId: VideoId,
		readonly videoPath: VideoFilepath,
		readonly offsetX: number | string | undefined,
		readonly offsetY: number | string | undefined,
		readonly rate: number | undefined,
		readonly effects: VideoEffects | undefined
	) {}
}

type AudioId = string;
type AudioFilename = string;
type AudioFilepath = string;

export class AudioTrack {
	constructor(
		readonly clips: AudioClip[],
		readonly audios: Record<AudioId, AudioFilename>
	) {}
}

export class AudioClip {
	constructor(
		readonly audioId: AudioId,
		readonly audioPath: AudioFilepath
	) {}
}

export class Manifest {
	constructor(
		readonly setId: string,
		readonly videoTrack: VideoTrack,
		readonly audioTrack: AudioTrack
	) {}
}
