import { Precondition } from '$lib/precondition';
import { EffectsMap } from '$lib/renderer/effects_map.svelte';
import type {
  AudioClipRaw,
  AudioTrackRaw,
  ManifestRaw,
  VideoClipRaw,
  VideoTrackRaw,
} from './manifest_raw';

type VideoId = string;
type VideoFilename = string;
type VideoFilepath = string;

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
    audioTrack,
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
      audioTrack: AudioTrack.createEmpty(),
    });
  }

  toRaw(): ManifestRaw {
    return {
      videoTrack: this.videoTrack.toRaw(),
      audioTrack: this.audioTrack.toRaw(),
    };
  }
}

export class VideoTrack {
  clips: VideoClip[];
  videos: Record<VideoId, VideoFilename>;
  transitionOut: VideoTransitionOut | undefined;
  effects: EffectsMap;

  constructor({
    clips,
    videos,
    transitionOut,
    effects,
  }: {
    clips: VideoClip[];
    videos: Record<VideoId, VideoFilename>;
    transitionOut: VideoTransitionOut | undefined;
    effects: EffectsMap;
  }) {
    this.clips = $state(clips);
    this.videos = $state(videos);
    this.transitionOut = $state(transitionOut);
    this.effects = $state(effects);
  }

  static createEmpty(): VideoTrack {
    return new VideoTrack({
      clips: [],
      videos: {},
      transitionOut: undefined,
      effects: EffectsMap.createEmpty(),
    });
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
    this.clips.push(
      VideoClip.createFromPath({ videoId: filename, videoPath: path }),
    );
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

  toRaw(): VideoTrackRaw {
    return {
      clips: this.clips.map((clip) => clip.toRaw()),
      videos: this.videos,
      effects: this.effects.toRaw(),
      transitionOut:
        (this.transitionOut?.duration ?? 0) > 0
          ? this.transitionOut
          : undefined,
    };
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
  effects: EffectsMap | undefined;

  constructor(args: {
    videoId: VideoId;
    videoPath: VideoFilepath;
    offsetX: number | string | undefined;
    offsetY: number | string | undefined;
    rate: number | undefined;
    trimEnd: number | undefined;
    transitionOut: VideoTransitionOut | undefined;
    effects: EffectsMap | undefined;
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

  static createFromPath({
    videoId,
    videoPath,
  }: {
    videoId: VideoId;
    videoPath: VideoFilepath;
  }) {
    return new VideoClip({
      videoId,
      videoPath,
      offsetX: undefined,
      offsetY: undefined,
      rate: undefined,
      trimEnd: undefined,
      transitionOut: undefined,
      effects: undefined,
    });
  }

  toRaw(): VideoClipRaw {
    return {
      videoId: this.videoId,
      rate: this.rate,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      trimEnd: this.trimEnd,
    };
  }
}

type AudioId = string;
type AudioFilename = string;
type AudioFilepath = string;

export class AudioTrack {
  clips: AudioClip[];
  audios: Record<AudioId, AudioFilename>;

  constructor({
    clips,
    audios,
  }: {
    clips: AudioClip[];
    audios: Record<AudioId, AudioFilename>;
  }) {
    this.clips = $state(clips);
    this.audios = $state(audios);
  }

  static createEmpty() {
    return new AudioTrack({ clips: [], audios: {} });
  }

  getClip(id: AudioId): AudioClip {
    return Precondition.checkExists(this.findClip(id));
  }

  findClip(id: AudioId) {
    return this.clips.find((clip) => clip.audioId === id);
  }

  toRaw(): AudioTrackRaw {
    return {
      clips: this.clips.map((clip) => clip.toRaw()),
      audios: this.audios,
    };
  }
}

export class AudioClip {
  readonly audioId: AudioId;
  readonly audioPath: AudioFilepath;
  trimEnd: number | undefined;

  constructor(args: {
    audioId: AudioId;
    audioPath: AudioFilepath;
    trimEnd: number | undefined;
  }) {
    this.audioId = args.audioId;
    this.audioPath = args.audioPath;
    this.trimEnd = $state(args.trimEnd);
  }

  toRaw(): AudioClipRaw {
    console.log(this);
    return {
      audioId: this.audioId,
      trimEnd: this.trimEnd,
    };
  }
}
