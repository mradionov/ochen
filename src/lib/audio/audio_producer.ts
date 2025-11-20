import type { AudioResolver } from '$lib/audio/audio_resolver';
import type { AudioTimeline } from '$lib/audio/audio_timeline.svelte';
import { AudioPlayer } from '$lib/audio/audio_player';

export class AudioProducer {
  private currentIndex: number | undefined;
  private currentPlayer: AudioPlayer | undefined;
  private nextPlayer: AudioPlayer | undefined;
  private isPlaying = false;

  constructor(
    private readonly audioTimeline: AudioTimeline,
    private readonly audioResolver: AudioResolver,
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
    const newTimelineClip = this.audioTimeline.findClipByTime(time);
    if (!newTimelineClip) {
      console.warn(`No audio clip for time "${time}"`);
      return;
    }

    const inClipTime = time - newTimelineClip.start;

    // Same clip
    if (this.currentIndex === newTimelineClip.index) {
      // Seek current clip
      this.maybeSeekCurrentPlayer(inClipTime);
      return;
    }

    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.pause();
    }

    // this.currentIndex = newTimelineClip.index;
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
      this.audioTimeline.getTimelineClips()[newCurrentIndex];
    if (!newCurrentTimelineClip) {
      throw new Error('No new current clip');
    }

    const newNextTimelineClip =
      this.audioTimeline.getTimelineClips()[newNextIndex];

    this.maybeDestroyCurrentPlayer();

    if (isNewCurrentNext && this.nextPlayer) {
      this.currentPlayer = this.nextPlayer;
      if (this.isPlaying) {
        this.currentPlayer.play();
      }
    } else {
      this.maybeDestroyNextPlayer();
      this.currentPlayer = AudioPlayer.createFromTimelineClip(
        newCurrentTimelineClip,
      );
    }

    this.currentPlayer.ended.addListenerOnce(this.onPlayerEnded);
    this.currentIndex = newCurrentIndex;

    if (newNextTimelineClip) {
      this.nextPlayer = AudioPlayer.createFromTimelineClip(newNextTimelineClip);
    }
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
