<script lang="ts">
  import VideoTrack from './video_track.svelte';
  import { getContext, onMount, untrack } from 'svelte';
  import { ManifestReader } from '$lib/manifest/manifest_reader';
  import { VideoResolver } from '$lib/video/video_resolver';
  import {
    AudioResolverKey,
    ProjectsControllerKey,
    RenderLoopKey,
    VideoResolverKey,
  } from '$lib/di';
  import { VideoTimeline } from '$lib/video/video_timeline.svelte';
  import type { VideoTimelineClip } from '$lib/video/video_timeline.svelte';
  import AudioTrack from './audio_track.svelte';
  import { AudioResolver } from '$lib/audio/audio_resolver';
  import { AudioTimeline } from '$lib/audio/audio_timeline.svelte.ts';
  import type { AudioTimelineClip } from '$lib/audio/audio_timeline.svelte';
  import { toClockString, toMinutesString } from '$lib/time_utils.js';
  import { AudioProducer } from '$lib/audio/audio_producer';
  import PlayheadTrack from './playhead_track.svelte';
  import { VideoProducer } from '$lib/video/video_producer';
  import { RenderLoop } from '$lib/render_loop';
  import { RunningClock } from '$lib/running_clock';
  import RendererSurface from '$lib/renderer/renderer_surface.svelte';
  import VideoClipDetails from './video_clip_details.svelte';
  import { Manifest } from '$lib/manifest/manifest.svelte';
  import ManifestSaveButton from '$lib/manifest/manifest_save_button.svelte';
  import { ProjectsController } from '$lib/projects/projects_controller';
  import { AudioCapture } from '$lib/audio/audio_capture';
  import { AudioAnalyser, type AudioInfo } from '$lib/audio/audio_analyser';
  import AudioClipDetails from './audio_clip_details.svelte';
  import type { RenderablePlayer } from '$lib/video/renderable_player';

  const projectsController = getContext<ProjectsController>(
    ProjectsControllerKey,
  );

  const renderLoop = getContext<RenderLoop>(RenderLoopKey);
  renderLoop.start();

  const videoResolver = getContext<VideoResolver>(VideoResolverKey);
  const audioResolver = getContext<AudioResolver>(AudioResolverKey);

  const audioCapture = new AudioCapture();
  const audioAnalyser = new AudioAnalyser();

  let audioInfo = $state<AudioInfo | undefined>(undefined);

  let manifest: Manifest = $state(Manifest.createEmpty());

  let videoProducer: VideoProducer;
  let audioProducer: AudioProducer;
  let timelineClock: RunningClock;

  let videoTimeline = $state.raw<VideoTimeline | undefined>(undefined);
  let audioTimeline = $state.raw<AudioTimeline | undefined>(undefined);

  let videoPlayer: RenderablePlayer | undefined = $state.raw(undefined);
  let nextVideoPlayer: RenderablePlayer | undefined = $state.raw(undefined);

  let videoTimelineClips: VideoTimelineClip[] = $derived(
    videoTimeline?.getTimelineClips() ?? [],
  );
  let audioTimelineClips: AudioTimelineClip[] = $derived(
    audioTimeline?.getTimelineClips() ?? [],
  );

  let selectedVideoTimelineClip: VideoTimelineClip | undefined =
    $state.raw(undefined);
  let selectedAudioTimelineClip: AudioTimelineClip | undefined =
    $state.raw(undefined);

  let videoDuration = $derived(videoTimeline?.getTotalDuration() ?? 0);
  let audioDuration = $derived(audioTimeline?.getTotalDuration() ?? 0);
  let maxDuration = $derived(Math.max(videoDuration, audioDuration));

  let playheadTime: number = $state.raw(0);

  let currentVideoTimelineClip: VideoTimelineClip = $derived(
    videoTimeline?.findClipByTime(playheadTime),
  );

  $effect(() => {
    // Makes sure to reset the players when timeline changes
    videoTimelineClips;
    audioTimelineClips;
    // But also skips updates if playhead time changes during playing
    videoProducer?.reset(untrack(() => playheadTime));
    audioProducer?.reset(untrack(() => playheadTime));
  });

  onMount(async () => {
    const projectName = await projectsController.fetchActiveProjectName();
    manifest = await new ManifestReader().read(projectName);
    console.log({ manifest });

    await videoResolver.loadMetadata(manifest.videoTrack.videoClips);
    videoTimeline = new VideoTimeline(manifest, videoResolver);

    await audioResolver.loadMetadata(manifest.audioTrack.clips);
    audioTimeline = new AudioTimeline(manifest, audioResolver);

    console.log(videoTimeline);

    videoProducer = new VideoProducer(videoTimeline);
    videoProducer.playerChanged.addListener(({ player, nextPlayer }) => {
      console.log('videoProducer#playerchanged', { player, nextPlayer });
      videoPlayer = player;
      nextVideoPlayer = nextPlayer;
    });
    videoProducer.load();

    audioProducer = new AudioProducer(audioTimeline, audioResolver);
    audioProducer.playerChanged.addListener(({ player }) => {
      console.log('audioProducer#playerchanged', { player });
      audioCapture.connectElement(player.element);
    });
    audioProducer.load();

    // await audioCapture.connect();
    // audioCapture.start();

    timelineClock = new RunningClock();

    renderLoop.tick.addListener(({ deltaTime }) => {
      const { data, sampleRate, fftSize } = audioCapture.update();
      audioInfo = audioAnalyser.process(data, sampleRate);

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
    audioCapture.start();
  }

  function handlePause() {
    audioProducer.pause();
    videoProducer.pause();
    timelineClock.pause();
  }

  function handleTogglePlay() {
    if (videoProducer.isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }

  function handlePlayheadSeek(newTime: number) {
    audioProducer.seek(newTime);
    videoProducer.seek(newTime);
    timelineClock.seek(newTime);
  }

  function handleVideoTimelineClipSelect(clip: VideoTimelineClip) {
    selectedVideoTimelineClip = clip;
    selectedAudioTimelineClip = undefined;
  }

  function handleAudioTimelineClipSelect(clip: AudioTimelineClip) {
    selectedAudioTimelineClip = clip;
    selectedVideoTimelineClip = undefined;
  }
</script>

<div>
  <ManifestSaveButton {manifest} />
  <hr />
  Video duration: {toMinutesString(videoDuration)} <br />
  Audio duration: {toMinutesString(audioDuration)} <br />
  Max duration: {toMinutesString(maxDuration)} <br />
  <hr />
  <button onclick={handlePlay}>play</button>
  <button onclick={handlePause}>pause</button>
  <hr />
  Time: {toClockString(playheadTime)} / {toClockString(maxDuration)}
  <div class="tracks">
    <PlayheadTrack
      time={playheadTime}
      {maxDuration}
      onSeek={handlePlayheadSeek}
    />
    <VideoTrack
      timelineClips={videoTimelineClips}
      {maxDuration}
      selectedTimelineClip={selectedVideoTimelineClip}
      onSelect={handleVideoTimelineClipSelect}
    />
    <AudioTrack
      timelineClips={audioTimelineClips}
      {maxDuration}
      selectedTimelineClip={selectedAudioTimelineClip}
      onSelect={handleAudioTimelineClipSelect}
    />
  </div>
  <hr />
  <div class="split">
    <div class="column">
      {#if videoPlayer}
        <RendererSurface
          onClick={handleTogglePlay}
          player={videoPlayer}
          nextPlayer={nextVideoPlayer}
          effects={manifest.videoTrack.effects}
          offset={{
            offsetX: currentVideoTimelineClip.clip.offsetX,
            offsetY: currentVideoTimelineClip.clip.offsetY,
          }}
          {audioInfo}
          width={500}
          height={500}
        />
      {/if}
    </div>
    <div class="column">
      {#if selectedVideoTimelineClip}
        <VideoClipDetails
          {playheadTime}
          {manifest}
          timelineClip={selectedVideoTimelineClip}
        />
      {/if}
      {#if selectedAudioTimelineClip}
        <AudioClipDetails
          {playheadTime}
          {manifest}
          timelineClip={selectedAudioTimelineClip}
        />
      {/if}
    </div>
  </div>
</div>

<style>
  .tracks {
    width: 100%;
  }

  .split {
    display: flex;
  }

  .column {
    flex: 1;
  }
</style>
