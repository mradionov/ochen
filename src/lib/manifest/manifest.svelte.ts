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

	renameClip(id: VideoId, newName: string) {}

	removeClip(id: VideoId) {
		this.clips = this.clips.filter((clip) => clip.videoId !== id);
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
	constructor(
		readonly videoId: VideoId,
		readonly videoPath: VideoFilepath,
		public offsetX: number | string | undefined,
		public offsetY: number | string | undefined,
		public rate: number | undefined,
		public trimEnd: number | undefined,
		readonly transitionOut: VideoTransitionOut | undefined,
		readonly effects: VideoEffects | undefined
	) {}

	static createFromPath({ videoId, videoPath }: { videoId: VideoId; videoPath: VideoFilepath }) {
		return new VideoClip(
			videoId,
			videoPath,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined
		);
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
	constructor(
		readonly audioId: AudioId,
		readonly audioPath: AudioFilepath
	) {}
}
