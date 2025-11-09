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

export type VideoClipRaw = {
  videoId: VideoId;
  rate?: number;
  offsetX?: number | string;
  offsetY?: number | string;
  trimEnd?: number;
};

type AudioId = string;

export type AudioClipRaw = {
  audioId: AudioId;
};

export type AudioTrackRaw = {
  clips: AudioClipRaw[];
  audios: Record<string, string>;
};
