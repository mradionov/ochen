import { Subject } from '../../lib/subject';
import type { RenderablePlayer } from '../video_player/renderable_player';
import { RenderablePlayerFactory } from '../video_player/renderable_player_factory';
import type {
  VideoTimelineClip,
  VideoTimelineSelectors,
} from '../video_timeline/video_timeline_selectors';

export class VideoProducer {
  private readonly videoTimeline: VideoTimelineSelectors;
  private currentIndex: number | undefined;
  private currentPlayer: RenderablePlayer | undefined;
  private nextPlayer: RenderablePlayer | undefined;
  private _isPlaying = false;

  readonly clipChanged = new Subject<VideoTimelineClip>();
  readonly playerChanged = new Subject<{
    player: RenderablePlayer;
    nextPlayer: RenderablePlayer | undefined;
    timelineClip: VideoTimelineClip;
<<<<<<< HEAD:src/features/video_producer/video_producer.ts
=======
    nextTimelineClip: VideoTimelineClip | undefined;
>>>>>>> main:src/lib/video/video_producer.ts
  }>();

  constructor(videoTimeline: VideoTimelineSelectors) {
    this.videoTimeline = videoTimeline;
  }

  reset(time: number) {
    this.currentIndex = undefined;
    this.currentPlayer = undefined;
    this.seek(time);
  }

  get isPlaying() {
    return this._isPlaying;
  }

  load() {
    this.ensurePlayer();
  }

  play() {
    if (this.isPlaying) {
      return;
    }
    this._isPlaying = true;
    this.ensurePlayer();
    this.currentPlayer?.play();
  }

  pause() {
    if (!this.isPlaying) {
      return;
    }
    this._isPlaying = false;
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
      console.warn('No new current clip for index', newCurrentIndex);
      return;
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
      this.currentPlayer = RenderablePlayerFactory.createFromTimelineClip(
        newCurrentTimelineClip,
      );
    }

    this.currentPlayer.ended.addListenerOnce(this.onPlayerEnded);
    this.currentIndex = newCurrentIndex;

    if (newNextTimelineClip) {
      this.nextPlayer =
        RenderablePlayerFactory.createFromTimelineClip(newNextTimelineClip);
    }

    this.clipChanged.emit(newNextTimelineClip);
    this.playerChanged.emit({
      player: this.currentPlayer,
      nextPlayer: this.nextPlayer,
      timelineClip: newCurrentTimelineClip,
<<<<<<< HEAD:src/features/video_producer/video_producer.ts
=======
      nextTimelineClip: newNextTimelineClip,
>>>>>>> main:src/lib/video/video_producer.ts
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
