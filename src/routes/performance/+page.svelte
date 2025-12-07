<script lang="ts">
  import { getContext, onMount } from 'svelte';
  import { ManifestReader } from '$lib/manifest/manifest_reader';
  import RendererSurface from '$lib/renderer/renderer_surface.svelte';
  import {
    AudioResolverKey,
    ProjectsControllerKey,
    RenderLoopKey,
    VideoResolverKey,
  } from '$lib/di';
  import { VideoPlayer } from '$lib/video/video_player';
  import { RenderProducer } from '$lib/video/render_producer';
  import { VideoResolver } from '$lib/video/video_resolver';
  import { AudioResolver } from '$lib/audio/audio_resolver';
  import {
    VideoTimeline,
    type VideoTimelineClip,
  } from '$lib/video/video_timeline.svelte';
  import { AudioTimeline } from '$lib/audio/audio_timeline.svelte';
  import { AudioProducer } from '$lib/audio/audio_producer';
  import { ProjectsController } from '$lib/projects/projects_controller';
  import { Manifest } from '$lib/manifest/manifest.svelte';
  import { RenderLoop } from '$lib/render_loop';
  import { AudioAnalyser, type AudioInfo } from '$lib/audio/audio_analyser';
  import { AudioCapture } from '$lib/audio/audio_capture';

  const projectsController = getContext<ProjectsController>(
    ProjectsControllerKey,
  );
  const videoResolver = getContext<VideoResolver>(VideoResolverKey);
  const audioResolver = getContext<AudioResolver>(AudioResolverKey);

  const renderLoop = getContext<RenderLoop>(RenderLoopKey);
  renderLoop.start();

  let contentElement: HTMLDivElement;

  let videoPlayer: VideoPlayer | undefined = $state.raw(undefined);
  let nextVideoPlayer: VideoPlayer | undefined = $state.raw(undefined);
  let currentVideoTimelineClip: VideoTimelineClip | undefined =
    $state.raw(undefined);

  const audioCapture = new AudioCapture();
  const audioAnalyser = new AudioAnalyser();

  let audioInfo = $state<AudioInfo | undefined>(undefined);

  let manifest: Manifest = $state(Manifest.createEmpty());

  let videoProducer: RenderProducer;
  let audioProducer: AudioProducer;

  onMount(async () => {
    const projectName = await projectsController.fetchActiveProjectName();
    manifest = await new ManifestReader().read(projectName);
    console.log({ manifest });

    await videoResolver.loadMetadata(manifest.videoTrack.clips);
    const videoTimeline = new VideoTimeline(manifest, videoResolver);

    await audioResolver.loadMetadata(manifest.audioTrack.clips);
    const audioTimeline = new AudioTimeline(manifest, audioResolver);

    videoProducer = new RenderProducer(videoTimeline);
    videoProducer.clipChanged.addListener((clip) => {
      currentVideoTimelineClip = clip;
    });
    videoProducer.playerChanged.addListener(({ player, nextPlayer }) => {
      videoPlayer = player;
      nextVideoPlayer = nextPlayer;
    });
    videoProducer.load();

    audioProducer = new AudioProducer(audioTimeline, audioResolver);
    audioProducer.playerChanged.addListener(({ player }) => {
      console.log('playerchanged', player);
      audioCapture.connectElement(player.element);
    });
    audioProducer.load();

    // await audioCapture.connectStream();

    renderLoop.tick.addListener(({ deltaTime }) => {
      const { data, sampleRate, fftSize } = audioCapture.update();
      audioInfo = audioAnalyser.process(data, sampleRate);
    });

    window.addEventListener('keypress', (e) => {
      if (e.code === 'Space') {
        videoProducer.play();
        audioProducer.play();
        audioCapture.start();
      }
    });
  });

  function handleFullscreen() {
    contentElement.requestFullscreen();
  }

  function handleFullscreenPlay() {
    videoProducer.play();
    contentElement.requestFullscreen();
  }

  function handleFullscreenPlayWithAudio() {
    videoProducer.play();
    audioProducer.play();
    audioCapture.start();
    contentElement.requestFullscreen();
  }
</script>

<div>
  <button onclick={handleFullscreen}> fullscreen </button>
  <button onclick={handleFullscreenPlay}>
    fullscreen and play (only video)
  </button>
  <button onclick={handleFullscreenPlayWithAudio}>
    fullscreen and play (with audio)
  </button>
  <hr />
  <div class="content" bind:this={contentElement}>
    {#if videoPlayer}
      <RendererSurface
        player={videoPlayer}
        nextPlayer={nextVideoPlayer}
        {audioInfo}
        effects={manifest.videoTrack.effects}
        offset={{
          offsetX: currentVideoTimelineClip?.clip.offsetX,
          offsetY: currentVideoTimelineClip?.clip.offsetY,
        }}
        width={800}
        height={800}
      />
    {/if}
  </div>
</div>

<style>
  .content {
    position: relative;
    padding-left: 400px;
  }
</style>
