<script lang='ts'>
  import VideoTrack from './video_track.svelte';
  import { getContext, onMount } from 'svelte';
  import { fetchManifest } from '$lib/manifest';
  import { VideoResolver } from '$lib/video_resolver';
  import { AudioResolverKey, RenderLoopKey, VideoResolverKey } from '$lib/di';
  import { VideoTimeline } from '$lib/video_timeline';
  import type { VideoTimelineClip } from '$lib/video_timeline';
  import AudioTrack from './audio_track.svelte';
  import { AudioResolver } from '$lib/audio_resolver';
  import { AudioTimeline } from '$lib/audio_timeline';
  import type { AudioTimelineClip } from '$lib/audio_timeline';
  import { toClockString, toMinutesString } from '$lib/time_utils.js';
  import { AudioProducer } from '$lib/audio_producer';
  import PlayheadTrack from './playhead_track.svelte';
  import { VideoProducer } from '$lib/video_producer';
  import { RenderLoop } from '$lib/render_loop';
  import { TimelineClock } from '$lib/timeline_clock';
  import type { VideoPlayer } from '$lib/video_player';
  import VideoRender from '$lib/video_render.svelte';

  const renderLoop = getContext<RenderLoop>(RenderLoopKey);
  const videoResolver = getContext<VideoResolver>(VideoResolverKey);
  const audioResolver = getContext<AudioResolver>(AudioResolverKey);

  let videoProducer: VideoProducer;
  let audioProducer: AudioProducer;
  let timelineClock: TimelineClock;

  let videoPlayer: VideoPlayer;

  let videoTimelineClips: VideoTimelineClip[] = [];
  let audioTimelineClips: AudioTimelineClip[] = [];
  let videoDuration: number = 0;
  let audioDuration: number = 0;
  let maxDuration: number = 0;
  let playheadTime: number = 0;

  onMount(async () => {
    const setId = '03_jrugz';
    const manifest = await fetchManifest(setId);
    console.log({ manifest });

    await videoResolver.loadMetadata(manifest.videoTrack.clips);
    const videoTimeline = new VideoTimeline(manifest, videoResolver);

    await audioResolver.loadMetadata(manifest.audioTrack.clips);
    const audioTimeline = new AudioTimeline(manifest, audioResolver);

    videoProducer = new VideoProducer(videoTimeline, videoResolver);
    videoProducer.playerChanged.addListener(({ player }) => {
      videoPlayer = player;
    });
    videoProducer.load();

    audioProducer = new AudioProducer(audioTimeline, audioResolver);
    audioProducer.load();

    videoTimelineClips = videoTimeline.getTimelineClips();
    audioTimelineClips = audioTimeline.getTimelineClips();

    videoDuration = videoTimeline.getTotalDuration();
    audioDuration = audioTimeline.getTotalDuration();
    maxDuration = Math.max(videoDuration, audioDuration);

    timelineClock = new TimelineClock();

    renderLoop.tick.addListener(({ deltaTime }) => {
      timelineClock.update({ deltaTime });
    });

    timelineClock.timeUpdate.addListener(({ time }) => {
      playheadTime = time;
    });
  });

  function handlePlay() {
    audioProducer.play();
    videoProducer.play();
    timelineClock.play();
  }

  function handlePause() {
    audioProducer.pause();
    videoProducer.pause();
    timelineClock.pause();
  }

  function handlePlayheadSeek(newTime: number) {
    audioProducer.seek(newTime);
    videoProducer.seek(newTime);
    timelineClock.seek(newTime);
  }
</script>

<div>
  Video duration: {toMinutesString(videoDuration)} <br />
  Audio duration: {toMinutesString(audioDuration)} <br />
  Max duration: {toMinutesString(maxDuration)} <br />
  <hr />
  <button on:click={handlePlay}>play</button>
  <button on:click={handlePause}>pause</button>
  <hr />
  Time: {toClockString(playheadTime)} / {toClockString(maxDuration)}
  <div class='tracks'>
    <PlayheadTrack time={playheadTime} maxDuration={maxDuration} onSeek={handlePlayheadSeek} />
    <VideoTrack timelineClips={videoTimelineClips} maxDuration={maxDuration} />
    <AudioTrack timelineClips={audioTimelineClips} maxDuration={maxDuration} />
  </div>
  <hr />
  {#if videoPlayer}
    <VideoRender player={videoPlayer} width={400} height={400} />
  {/if}
</div>

<style>
  .tracks {
    width: 100%;
  }
</style>
