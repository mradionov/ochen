type VideoId = string;
type VideoFilename = string;
type VideoFilepath = string;

type VideoEffects = {
	tint?: string;
	vignette?: boolean;
	grain?: number;
	blur?: number;
};

export type VideoTransitionOut = {
	duration: number;
	kind: 'cut' | 'fade';
};

export class VideoTrack {
	constructor(
		readonly clips: VideoClip[],
		readonly videos: Record<VideoId, VideoFilename>,
		readonly transitionOut: VideoTransitionOut,
		readonly effects: VideoEffects | undefined
	) {}

	findClip(id: VideoId) {
		return this.clips.find((clip) => clip.videoId === id);
	}

	moveLeft(id: VideoId) {
		const index = this.clips.findIndex((clip) => clip.videoId === id);
		if (index === 0) {
			return;
		}
		const leftIndex = index - 1;
		const temp = this.clips[index];
		this.clips[index] = this.clips[leftIndex];
		this.clips[leftIndex] = temp;
	}

	moveRight(id: VideoId) {
		const index = this.clips.findIndex((clip) => clip.videoId === id);
		if (index > this.clips.length - 1) {
			return;
		}
		const rightIndex = index + 1;
		const temp = this.clips[index];
		this.clips[index] = this.clips[rightIndex];
		this.clips[rightIndex] = temp;
	}
}

export class VideoClip {
	constructor(
		readonly videoId: VideoId,
		readonly videoPath: VideoFilepath,
		public offsetX: number | string | undefined,
		public offsetY: number | string | undefined,
		public rate: number | undefined,
		public trimEnd: number | undefined,
		readonly transitionOut: VideoTransitionOut,
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
