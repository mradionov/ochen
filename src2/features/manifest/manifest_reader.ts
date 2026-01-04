import { AudioTrackStore } from './stores/audio_track_store';
import {
  ManifestSchema,
  type AudioFilepath,
  type AudioId,
  type ManifestRaw,
  type VideoFilepath,
  type VideoId,
} from './manifest_schema';
import { ManifestStore } from './stores/manifest_store';
import { VideoClipStore } from './stores/video_clip_store';
import { VideoTrackStore } from './stores/video_track_store';
import { EffectsStore } from '../renderer/effects_store';
import { AudioClipStore } from './stores/audio_clip_store';

export class ManifestReader {
  async read(projectName: string): Promise<ManifestStore> {
    const res = await fetch(`/sets/${projectName}/manifest.json`);
    const manifestText = await res.text();
    let manifestJson;
    try {
      manifestJson = JSON.parse(manifestText);
    } catch (error) {
      console.warn('Failed to parse manifest JSON: ', error);
      manifestJson = {};
    }
    const manifestRaw = ManifestSchema.parse(manifestJson);
    return this.parse(projectName, manifestRaw);
  }

  private parse(projectName: string, manifestRaw: ManifestRaw): ManifestStore {
    const videoTrackStore = this.transformVideoTrack(projectName, manifestRaw);
    const audioTrackStore = this.transformAudioTrack(projectName, manifestRaw);
    return new ManifestStore({ projectName }, videoTrackStore, audioTrackStore);
  }

  private transformVideoTrack(
    projectName: string,
    manifestRaw: ManifestRaw,
  ): VideoTrackStore {
    const { videoTrack: videoTrackRaw } = manifestRaw;
    const {
      clips: videoClipsRaw,
      effects: effectsRaw,
      transitionOut,
    } = videoTrackRaw;

    const effectsStore = new EffectsStore(effectsRaw);

    const videoMap = this.parseVideoMap(projectName, manifestRaw);

    const videoIdSet = new Set<VideoId>();
    const clips = videoClipsRaw.map((clipRaw) => {
      const { videoId, duration, offsetX, offsetY, rate, trimEnd } = clipRaw;

      if (videoIdSet.has(videoId)) {
        console.log(`Duplicate video id: "${videoId}"`);
      }
      videoIdSet.add(videoId);

      const videoPath = videoMap.get(videoId);
      if (!videoPath) {
        throw new Error(`No video found for "${videoId}"`);
      }

      return new VideoClipStore(
        {
          videoId,
          videoPath,
          duration,
          offsetX,
          offsetY,
          rate,
          trimEnd,
          transitionOut,
        },
        effectsStore,
      );
    });

    return new VideoTrackStore(
      {
        videos: videoTrackRaw.videos,
        transitionOut,
      },
      clips,
      effectsStore,
    );
  }

  private parseVideoMap(
    projectName: string,
    manifestRaw: ManifestRaw,
  ): ReadonlyMap<VideoId, VideoFilepath> {
    const { videos } = manifestRaw.videoTrack;

    const videoMap = new Map<VideoId, VideoFilepath>();
    const basePath = `/sets/${projectName}/videos`;

    Object.keys(videos).forEach((name) => {
      const fileName = videos[name];
      const filePath = `${basePath}/${fileName}`;
      videoMap.set(name, filePath);
    });

    return videoMap;
  }

  private transformAudioTrack(
    projectName: string,
    manifestRaw: ManifestRaw,
  ): AudioTrackStore {
    const { audioTrack: audioTrackRaw } = manifestRaw;
    const { clips: audioClipsRaw } = audioTrackRaw;

    const audioMap = this.parseAudioMap(projectName, manifestRaw);

    const audioIdSet = new Set<AudioId>();
    const clips = audioClipsRaw.map((clipRaw) => {
      const { audioId, trimEnd } = clipRaw;

      if (audioIdSet.has(audioId)) {
        console.log(`Duplicate audio id: "${audioId}"`);
      }
      audioIdSet.add(audioId);

      const audioPath = audioMap.get(audioId);
      if (!audioPath) {
        throw new Error(`No audio found for "${audioId}"`);
      }

      return new AudioClipStore({ audioId, audioPath, trimEnd });
    });

    return new AudioTrackStore({ audios: audioTrackRaw.audios }, clips);
  }

  private parseAudioMap(
    projectName: string,
    manifestRaw: ManifestRaw,
  ): ReadonlyMap<AudioId, AudioFilepath> {
    const { audios } = manifestRaw.audioTrack;

    const audioMap = new Map<AudioId, AudioFilepath>();
    const basePath = `/sets/${projectName}/audios`;

    Object.keys(audios).forEach((name) => {
      const fileName = audios[name];
      const filePath = `${basePath}/${fileName}`;
      audioMap.set(name, filePath);
    });

    return audioMap;
  }
}
