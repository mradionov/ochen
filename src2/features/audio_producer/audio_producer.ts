import { AudioPlayer } from '../audio/audio_player';
import { Subject } from '../../lib/subject';
import type { AudioTimelineSelectors } from '../audio_timeline/audio_timeline_selectors';

export class AudioProducer {
  private readonly audioTimeline: AudioTimelineSelectors;
  private currentIndex: number | undefined;
  private currentPlayer: AudioPlayer | undefined;
  private nextPlayer: AudioPlayer | undefined;
  private isPlaying = false;

  readonly playerChanged = new Subject<{
    player: AudioPlayer;
    nextPlayer: AudioPlayer | undefined;
  }>();

  constructor(audioTimeline: AudioTimelineSelectors) {
    this.audioTimeline = audioTimeline;
  }

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
      console.warn('No new current clip for index', newCurrentIndex);
      return;
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
