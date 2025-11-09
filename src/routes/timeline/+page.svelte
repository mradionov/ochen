<script lang='ts'>
  import VideoTrack from './video_track.svelte';
  import { getContext, onMount, untrack } from 'svelte';
  import { ManifestReader } from '$lib/manifest/manifest_reader';
  import { VideoResolver } from '$lib/video/video_resolver';
  import { AudioResolverKey, ProjectsControllerKey, RenderLoopKey, VideoResolverKey } from '$lib/di';
  import { VideoTimeline } from '$lib/video/video_timeline.svelte';
  import type { VideoTimelineClip } from '$lib/video/video_timeline.svelte';
  import AudioTrack from './audio_track.svelte';
  import { AudioResolver } from '$lib/audio/audio_resolver';
  import { AudioTimeline } from '$lib/audio/audio_timeline';
  import type { AudioTimelineClip } from '$lib/audio/audio_timeline';
  import { toClockString, toMinutesString } from '$lib/time_utils.js';
  import { AudioProducer } from '$lib/audio/audio_producer';
  import PlayheadTrack from './playhead_track.svelte';
  import { VideoProducer } from '$lib/video/video_producer';
  import { RenderLoop } from '$lib/render_loop';
  import { TimelineClock } from '$lib/timeline_clock';
  import type { VideoPlayer } from '$lib/video/video_player';
  import VideoRendererSurface from '$lib/video/video_renderer_surface.svelte';
  import VideoInfo from './video_info.svelte';
  import { Manifest } from '$lib/manifest/manifest.svelte';
  import ManifestSaveButton from '$lib/manifest/manifest_save_button.svelte';
  import { ProjectsController } from '$lib/projects/projects_controller';

  const projectsController = getContext<ProjectsController>(ProjectsControllerKey);
  const renderLoop = getContext<RenderLoop>(RenderLoopKey);
  const videoResolver = getContext<VideoResolver>(VideoResolverKey);
  const audioResolver = getContext<AudioResolver>(AudioResolverKey);

  let manifest: Manifest = $state(Manifest.createEmpty());

  let videoProducer: VideoProducer;
  let audioProducer: AudioProducer;
  let timelineClock: TimelineClock;

  let videoTimeline: VideoTimeline | undefined = $state.raw(undefined);
  let audioTimeline: AudioTimeline | undefined = $state.raw(undefined);

  let videoPlayer: VideoPlayer | undefined = $state.raw(undefined);
  let nextVideoPlayer: VideoPlayer | undefined = $state.raw(undefined);

  let videoTimelineClips: VideoTimelineClip[] = $derived(videoTimeline?.getTimelineClips());
  let audioTimelineClips: AudioTimelineClip[] = $derived(audioTimeline?.getTimelineClips());

  let selectedVideoTimelineClip: VideoTimelineClip | undefined = $state.raw(undefined);

  let videoDuration: number = $derived(videoTimeline?.getTotalDuration());
  let audioDuration: number = $derived(audioTimeline?.getTotalDuration());
  let maxDuration = $derived(Math.max(videoDuration, audioDuration));

  let playheadTime: number = $state.raw(0);

  $effect(() => {
    // Makes sure to reset the players when timeline changes
    videoTimelineClips;
    // But also skips updates if playhead time changes during playing
    videoProducer?.reset(untrack(() => playheadTime));
  });

  onMount(async () => {
    const projectName = await projectsController.fetchActiveProjectName();
    manifest = await new ManifestReader().read(projectName);
    console.log({ manifest });

    await videoResolver.loadMetadata(manifest.videoTrack.clips);
    videoTimeline = new VideoTimeline(manifest, videoResolver);

    await audioResolver.loadMetadata(manifest.audioTrack.clips);
    audioTimeline = new AudioTimeline(manifest, audioResolver);

    videoProducer = new VideoProducer(videoTimeline, videoResolver);
    videoProducer.playerChanged.addListener(({ player, nextPlayer }) => {
      videoPlayer = player;
      nextVideoPlayer = nextPlayer;
    });
    videoProducer.load();

    audioProducer = new AudioProducer(audioTimeline, audioResolver);
    audioProducer.load();

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

  function handleVideoTimelineClipSelect(clip: VideoTimelineClip) {
    selectedVideoTimelineClip = clip;
  }
</script>

<div>
  <ManifestSaveButton manifest={manifest} />
  <hr />
  Video duration: {toMinutesString(videoDuration)} <br />
  Audio duration: {toMinutesString(audioDuration)} <br />
  Max duration: {toMinutesString(maxDuration)} <br />
  <hr />
  <button onclick={handlePlay}>play</button>
  <button onclick={handlePause}>pause</button>
  <hr />
  Time: {toClockString(playheadTime)} / {toClockString(maxDuration)}
  <div class='tracks'>
    <PlayheadTrack time={playheadTime} maxDuration={maxDuration} onSeek={handlePlayheadSeek} />
    <VideoTrack
      timelineClips={videoTimelineClips}
      maxDuration={maxDuration}
      selectedTimelineClip={selectedVideoTimelineClip}
      onSelect={handleVideoTimelineClipSelect}
    />
    <AudioTrack timelineClips={audioTimelineClips} maxDuration={maxDuration} />
  </div>
  <hr />
  <div class='split'>
    <div class='column'>
      {#if videoPlayer}
        <VideoRendererSurface
          player={videoPlayer}
          nextPlayer={nextVideoPlayer}
          width={400}
          height={400}
        />
      {/if}
    </div>
    <div class='column'>
      {#if selectedVideoTimelineClip}
        <VideoInfo
          manifest={manifest}
          timelineClip={selectedVideoTimelineClip}
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
