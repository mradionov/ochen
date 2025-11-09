import type { VideoTimeline } from '$lib/video/video_timeline.svelte';
import type { VideoResolver } from '$lib/video/video_resolver';
import { VideoPlayer } from '$lib/video/video_player';
import { Subject } from '$lib/subject';

export class VideoProducer {
  private currentIndex: number | undefined;
  private currentPlayer: VideoPlayer | undefined;
  private nextPlayer: VideoPlayer | undefined;
  private isPlaying = false;

  readonly playerChanged = new Subject<{
    player: VideoPlayer;
    nextPlayer: VideoPlayer | undefined;
  }>();

  constructor(
    private readonly videoTimeline: VideoTimeline,
    private readonly videoResolver: VideoResolver,
  ) {}

  reset(time: number) {
    this.currentIndex = undefined;
    this.currentPlayer = undefined;
    this.seek(time);
  }

  load() {
    this.ensurePlayer();
  }

  play() {
    if (this.isPlaying) {
      return;
    }
    this.isPlaying = true;
    this.ensurePlayer();
    this.currentPlayer?.play();
  }

  pause() {
    if (!this.isPlaying) {
      return;
    }
    this.isPlaying = false;
    this.ensurePlayer();
    this.currentPlayer?.pause();
  }

  seek(time: number) {
    const newTimelineClip = this.videoTimeline.findClipByTime(time);
    if (!newTimelineClip) {
      console.warn(`No video clip for time "${time}"`);
      return;
    }

    const inClipTime = time - newTimelineClip.start;

    if (this.currentIndex === newTimelineClip.index) {
      this.maybeSeekCurrentPlayer(inClipTime);
      return;
    }

    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.pause();
    }

    this.ensurePlayer({ newIndex: newTimelineClip.index });
    this.maybeSeekCurrentPlayer(inClipTime);

    if (wasPlaying) {
      this.play();
    }
  }

  private ensurePlayer({ newIndex }: { newIndex?: number } = {}) {
    const hasAnyPlayer = this.currentIndex != null;
    const isNewIndex = newIndex != null && this.currentIndex !== newIndex;
    const shouldUpdate = !hasAnyPlayer || isNewIndex;
    if (!shouldUpdate) {
      return;
    }

    const newCurrentIndex =
      newIndex != null
        ? newIndex
        : this.currentIndex != null
          ? this.currentIndex
          : 0;
    const newNextIndex = newCurrentIndex + 1;
    const isNewCurrentNext = this.currentIndex === newCurrentIndex - 1;

    const newCurrentTimelineClip =
      this.videoTimeline.getTimelineClips()[newCurrentIndex];
    if (!newCurrentTimelineClip) {
      throw new Error('No new current clip');
    }
    const newNextTimelineClip =
      this.videoTimeline.getTimelineClips()[newNextIndex];

    this.maybeDestroyCurrentPlayer();

    if (isNewCurrentNext && this.nextPlayer) {
      this.currentPlayer = this.nextPlayer;
      if (this.isPlaying) {
        this.currentPlayer.play();
      }
    } else {
      this.maybeDestroyNextPlayer();
      this.currentPlayer = VideoPlayer.createFromTimelineClip(
        newCurrentTimelineClip,
      );
    }

    this.currentPlayer.ended.addListenerOnce(this.onPlayerEnded);
    this.currentIndex = newCurrentIndex;

    if (newNextTimelineClip) {
      this.nextPlayer = VideoPlayer.createFromTimelineClip(newNextTimelineClip);
    }

    this.playerChanged.emit({
      player: this.currentPlayer,
      nextPlayer: this.nextPlayer,
    });
  }

  private maybeDestroyCurrentPlayer() {
    if (this.currentPlayer) {
      this.currentPlayer.destroy();
      this.currentPlayer = undefined;
    }
  }

  private maybeDestroyNextPlayer() {
    if (this.nextPlayer) {
      this.nextPlayer.destroy();
      this.nextPlayer = undefined;
    }
  }

  private maybeSeekCurrentPlayer(inClipTime: number) {
    this.currentPlayer?.seek(inClipTime);
  }

  private onPlayerEnded = () => {
    console.log('onPlayerEnded');
    if (this.currentIndex == null) {
      throw new Error('A player must already exist');
    }
    const newIndex = this.currentIndex + 1;

    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.pause();
    }

    this.ensurePlayer({ newIndex });

    if (wasPlaying) {
      this.play();
    }
  };
}
