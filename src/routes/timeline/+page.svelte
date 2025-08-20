<script lang='ts'>
  import VideoTrack from './video_track.svelte';
  import { getContext, onMount } from 'svelte';
  import { fetchManifest } from '$lib/manifest';
  import { VideoResolver } from '$lib/video_resolver';
  import { AudioResolverKey, VideoResolverKey } from '$lib/di';
  import { VideoTimeline } from '$lib/video_timeline';
  import type { VideoTimelineClip } from '$lib/video_timeline';
  import AudioTrack from './audio_track.svelte';
  import { AudioResolver } from '$lib/audio_resolver';
  import { AudioTimeline } from '$lib/audio_timeline';
  import type { AudioTimelineClip } from '$lib/audio_timeline';
  import { toMinutesString } from '$lib/time_utils.js';

  const videoResolver = getContext<VideoResolver>(VideoResolverKey);
  const audioResolver = getContext<AudioResolver>(AudioResolverKey);

  let videoTimelineClips: VideoTimelineClip[] = [];
  let audioTimelineClips: AudioTimelineClip[] = [];
  let videoDuration: number = 0;
  let audioDuration: number = 0;
  let maxDuration: number = 0;

  onMount(async () => {
    const setId = '03_jrugz';
    const manifest = await fetchManifest(setId);
    console.log({ manifest });

    await videoResolver.loadMetadata(manifest.videoTrack.clips);
    const videoTimeline = new VideoTimeline(manifest, videoResolver);

    await audioResolver.loadMetadata(manifest.audioTrack.clips);
    const audioTimeline = new AudioTimeline(manifest, audioResolver);

    videoTimelineClips = videoTimeline.getTimelineClips();
    audioTimelineClips = audioTimeline.getTimelineClips();

    videoDuration = videoTimeline.getTotalDuration();
    audioDuration = audioTimeline.getTotalDuration();
    maxDuration = Math.max(videoDuration, audioDuration);
  });
</script>

<div>
  Video duration: {toMinutesString(videoDuration)} <br />
  Audio duration: {toMinutesString(audioDuration)} <br />
  Max duration: {toMinutesString(maxDuration)} <br />
  <hr />
  <div class='tracks'>
    <VideoTrack timelineClips={videoTimelineClips} maxDuration={maxDuration} />
    <AudioTrack timelineClips={audioTimelineClips} maxDuration={maxDuration} />
  </div>
</div>

<style>
  .tracks {
    width: 100%;
  }
</style>
