import { Precondition } from '$lib/precondition';

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

export class Manifest {
	readonly projectName: string | undefined;
	videoTrack: VideoTrack;
	audioTrack: AudioTrack;

	constructor({
		projectName,
		videoTrack,
		audioTrack
	}: {
		projectName: string | undefined;
		videoTrack: VideoTrack;
		audioTrack: AudioTrack;
	}) {
		this.projectName = projectName;
		this.videoTrack = $state(videoTrack);
		this.audioTrack = $state(audioTrack);
	}

	static createEmpty() {
		return new Manifest({
			projectName: undefined,
			videoTrack: VideoTrack.createEmpty(),
			audioTrack: AudioTrack.createEmpty()
		});
	}
}

export class VideoTrack {
	clips;
	videos: Record<VideoId, VideoFilename>;
	transitionOut: VideoTransitionOut | undefined;
	effects: VideoEffects | undefined;

	constructor({
		clips,
		videos,
		transitionOut,
		effects
	}: {
		clips: VideoClip[];
		videos: Record<VideoId, VideoFilename>;
		transitionOut: VideoTransitionOut | undefined;
		effects: VideoEffects | undefined;
	}) {
		this.clips = $state(clips);
		this.videos = $state(videos);
		this.transitionOut = $state(transitionOut);
		this.effects = $state(effects);
	}

	static createEmpty() {
		return new VideoTrack({ clips: [], videos: {}, transitionOut: undefined, effects: undefined });
	}

	addVideo(filename: string) {
		if (this.videos[filename] != null) {
			return;
		}
		this.videos[filename] = filename;
	}

	removeVideo(filename: string) {
		delete this.videos[filename];
	}

	getVideoFilenames() {
		return Object.values(this.videos);
	}

	addClip(filename: string, path: string) {
		if (this.findClip(filename)) {
			return;
		}
		this.clips.push(VideoClip.createFromPath({ videoId: filename, videoPath: path }));
	}

	removeClip(id: VideoId) {
		this.clips = this.clips.filter((clip) => clip.videoId !== id);
	}

	getClip(id: VideoId): VideoClip {
		return Precondition.checkExists(this.findClip(id));
	}

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
	readonly videoId: VideoId;
	readonly videoPath: VideoFilepath;
	offsetX: number | string | undefined;
	offsetY: number | string | undefined;
	rate: number | undefined;
	trimEnd: number | undefined;
	transitionOut: VideoTransitionOut | undefined;
	effects: VideoEffects | undefined;

	constructor(args: {
		videoId: VideoId;
		videoPath: VideoFilepath;
		offsetX: number | string | undefined;
		offsetY: number | string | undefined;
		rate: number | undefined;
		trimEnd: number | undefined;
		transitionOut: VideoTransitionOut | undefined;
		effects: VideoEffects | undefined;
	}) {
		this.videoId = args.videoId;
		this.videoPath = args.videoPath;
		this.offsetX = $state(args.offsetX);
		this.offsetY = $state(args.offsetY);
		this.rate = $state(args.rate);
		this.trimEnd = $state(args.trimEnd);
		this.transitionOut = $state(args.transitionOut);
		this.effects = $state(args.effects);
	}

	static createFromPath({ videoId, videoPath }: { videoId: VideoId; videoPath: VideoFilepath }) {
		return new VideoClip({
			videoId,
			videoPath,
			offsetX: undefined,
			offsetY: undefined,
			rate: undefined,
			trimEnd: undefined,
			transitionOut: undefined,
			effects: undefined
		});
	}
}

type AudioId = string;
type AudioFilename = string;
type AudioFilepath = string;

export class AudioTrack {
	clips: AudioClip[];
	audios: Record<AudioId, AudioFilename>;

	constructor({ clips, audios }: { clips: AudioClip[]; audios: Record<AudioId, AudioFilename> }) {
		this.clips = $state(clips);
		this.audios = $state(audios);
	}

	static createEmpty() {
		return new AudioTrack({ clips: [], audios: {} });
	}
}

export class AudioClip {
	readonly audioId: AudioId;
	readonly audioPath: AudioFilepath;

	constructor(args: { audioId: AudioId; audioPath: AudioFilepath }) {
		this.audioId = args.audioId;
		this.audioPath = args.audioPath;
	}
}
