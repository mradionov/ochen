<script lang='ts'>
  import { getContext, onMount } from 'svelte';
  import { ManifestReader } from '$lib/manifest/manifest_reader';
  import VideoRender from '$lib/video/video_render.svelte';
  import { AudioResolverKey, ProjectsControllerKey, VideoResolverKey } from '$lib/di';
  import { VideoPlayer } from '$lib/video/video_player';
  import { VideoProducer } from '$lib/video/video_producer';
  import { VideoResolver } from '$lib/video/video_resolver';
  import { AudioResolver } from '$lib/audio/audio_resolver';
  import { VideoTimeline } from '$lib/video/video_timeline';
  import { AudioTimeline } from '$lib/audio/audio_timeline';
  import { AudioProducer } from '$lib/audio/audio_producer';
  import { ProjectsController } from '$lib/projects/projects_controller';

  const projectsController = getContext<ProjectsController>(ProjectsControllerKey);
  const videoResolver = getContext<VideoResolver>(VideoResolverKey);
  const audioResolver = getContext<AudioResolver>(AudioResolverKey);

  let contentElement: HTMLDivElement;

  let videoPlayer: VideoPlayer = $state.raw(undefined);
  let nextVideoPlayer: VideoPlayer | undefined = $state.raw(undefined);

  let videoProducer: VideoProducer;
  let audioProducer: AudioProducer;

  onMount(async () => {
    const projectName = await projectsController.fetchActiveProjectName();
    const manifest = await new ManifestReader().read(projectName);
    console.log(manifest);

    await videoResolver.loadMetadata(manifest.videoTrack.clips);
    const videoTimeline = new VideoTimeline(manifest, videoResolver);

    await audioResolver.loadMetadata(manifest.audioTrack.clips);
    const audioTimeline = new AudioTimeline(manifest, audioResolver);

    videoProducer = new VideoProducer(videoTimeline, videoResolver);
    videoProducer.playerChanged.addListener(({ player, nextPlayer }) => {
      videoPlayer = player;
      nextVideoPlayer = nextPlayer;
    });
    videoProducer.load();

    audioProducer = new AudioProducer(audioTimeline, audioResolver);
    audioProducer.load();

    window.addEventListener('keypress', (e) => {
      if (e.code === 'Space') {
        videoProducer.play();
        audioProducer.play();
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
    contentElement.requestFullscreen();
  }
</script>

<div>
  <button on:click={handleFullscreen}>
    fullscreen
  </button>
  <button on:click={handleFullscreenPlay}>
    fullscreen and play (only video)
  </button>
  <button on:click={handleFullscreenPlayWithAudio}>
    fullscreen and play (with audio)
  </button>
  <hr />
  <div class='content' bind:this={contentElement}>
    {#if videoPlayer}
      <VideoRender
        player={videoPlayer}
        nextPlayer={nextVideoPlayer}
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
