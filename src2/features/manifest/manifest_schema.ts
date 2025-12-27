import * as z from 'zod';
import { EffectsSchema } from '../renderer/effects_schema';

export type VideoId = string;
export type VideoFilename = string;
export type VideoFilepath = string;
export type VideoMap = Record<VideoId, VideoFilename>;

export type AudioId = string;
export type AudioFilename = string;
export type AudioFilepath = string;
export type AudioMap = Record<AudioId, AudioFilename>;

export const VideoTransitionOutSchema = z.object({
  duration: z.number().prefault(0),
  kind: z.enum(['cut', 'fade']).prefault('cut'),
});

export type VideoTransitionOut = z.infer<typeof VideoTransitionOutSchema>;

export const VideoClipSchema = z.object({
  videoId: z.string(),
  duration: z.number().prefault(0),
  rate: z.number().prefault(1),
  offsetX: z.union([z.number(), z.string()]).prefault('left'),
  offsetY: z.union([z.number(), z.string()]).prefault('top'),
  trimEnd: z.number().prefault(0),
});

export const VideoTrackSchema = z.object({
  transitionOut: VideoTransitionOutSchema.prefault({}),
  effects: EffectsSchema.prefault({}),
  clips: z.array(VideoClipSchema).prefault([]),
  videos: z.record(z.string(), z.string()).prefault({}),
});

const AudioClipSchema = z.object({
  audioId: z.string(),
  trimEnd: z.number().prefault(0),
});

export const AudioTrackSchema = z.object({
  clips: z.array(AudioClipSchema).prefault([]),
  audios: z.record(z.string(), z.string()).prefault({}),
});

export const ManifestSchema = z.object({
  videoTrack: VideoTrackSchema.prefault({}),
  audioTrack: AudioTrackSchema.prefault({}),
});

export type ManifestParsed = z.infer<typeof ManifestSchema>;
