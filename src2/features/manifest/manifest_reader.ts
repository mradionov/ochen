import { AudioTrackStore } from './stores/audio_track_store';
import {
  ManifestSchema,
  type AudioFilepath,
  type AudioId,
  type ManifestParsed,
  type VideoFilepath,
  type VideoId,
} from './manifest_schema';
import { ManifestStore } from './stores/manifest_store';
import { VideoClipStore } from './stores/video_clip_store';
import { VideoTrackStore } from './stores/video_track_store';
import { EffectsStore } from '../renderer/stores/effects_store';
import { AudioClipStore } from './stores/audio_clip_store';

export class ManifestReader {
  async read(projectName: string): Promise<ManifestStore> {
    const res = await fetch(`/sets/${projectName}/manifest.json`);
    const manifestJson = await res.json();
    const manifestParsed = ManifestSchema.parse(manifestJson);
    return this.parse(projectName, manifestParsed);
  }

  private parse(
    projectName: string,
    manifestParsed: ManifestParsed,
  ): ManifestStore {
    const videoTrackStore = this.transformVideoTrack(
      projectName,
      manifestParsed,
    );
    const audioTrackStore = this.transformAudioTrack(
      projectName,
      manifestParsed,
    );
    return new ManifestStore({ projectName }, videoTrackStore, audioTrackStore);
  }

  private transformVideoTrack(
    projectName: string,
    manifestParsed: ManifestParsed,
  ): VideoTrackStore {
    const { videoTrack: videoTrackParsed } = manifestParsed;
    const { clips: videoClipsParsed, transitionOut } = videoTrackParsed;

    // const effectsRaw = videoTrackRaw.effects;
    const effectsStore = new EffectsStore();

    const videoMap = this.parseVideoMap(projectName, manifestParsed);

    const videoIdSet = new Set<VideoId>();
    const clips = videoClipsParsed.map((clipParsed) => {
      const { videoId, duration, offsetX, offsetY, rate, trimEnd } = clipParsed;

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
        videos: videoTrackParsed.videos,
        transitionOut,
      },
      clips,
      effectsStore,
    );
  }

  private parseVideoMap(
    projectName: string,
    manifestParsed: ManifestParsed,
  ): ReadonlyMap<VideoId, VideoFilepath> {
    const { videos } = manifestParsed.videoTrack;

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
    manifestParsed: ManifestParsed,
  ): AudioTrackStore {
    const { audioTrack: audioTrackParsed } = manifestParsed;
    const { clips: audioClipsParsed } = audioTrackParsed;

    const audioMap = this.parseAudioMap(projectName, manifestParsed);

    const audioIdSet = new Set<AudioId>();
    const clips = audioClipsParsed.map((clipParsed) => {
      const { audioId, trimEnd } = clipParsed;

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

    return new AudioTrackStore({ audios: audioTrackParsed.audios }, clips);
  }

  private parseAudioMap(
    projectName: string,
    manifestParsed: ManifestParsed,
  ): ReadonlyMap<AudioId, AudioFilepath> {
    const { audios } = manifestParsed.audioTrack;

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
