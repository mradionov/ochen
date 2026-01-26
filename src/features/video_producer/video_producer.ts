import type { RunningClock } from '../../lib/running_clock';
import { Subject } from '../../lib/subject';
import type { VideoId } from '../manifest/manifest_schema';
import type { RenderFrame } from '../renderer/render_frame';
import type { RenderablePlayer } from '../video_player/renderable_player';
import { RenderablePlayerFactory } from '../video_player/renderable_player_factory';
import type { VideoTimelineClip } from '../video_timeline/video_timeline_selectors';
import type { VideoTimelineSnap } from '../video_timeline/video_timeline_store';

export type VideoFrame = RenderFrame & {
  timelineClip: VideoTimelineClip;
};

const ADVANCE_TIME = 10;

export class VideoProducer {
  private videoTimelineSnap: VideoTimelineSnap | undefined;
  private time: number = 0;

  // private currentIndex: number | undefined;
  // private currentPlayer: RenderablePlayer | undefined;
  // private nextPlayer: RenderablePlayer | undefined;
  // private currentTimelineClip: VideoTimelineClip | undefined;
  private _isPlaying = false;

  private playerMap = new Map<
    VideoId,
    {
      player: RenderablePlayer;
      timelineClip: VideoTimelineClip;
    }
  >();

  readonly clipChanged = new Subject<VideoTimelineClip>();

  constructor(timelineClock: RunningClock) {
    timelineClock.timeUpdate.addListener(({ time }) => {
      this.updateTime(time);
    });
  }

  updateTimeline(videoTimelineSnap: VideoTimelineSnap) {
    this.videoTimelineSnap = videoTimelineSnap;
    this.maybeUpdatePlayers();
  }

  private updateTime(time: number) {
    this.time = time;
    this.maybeUpdatePlayers();
  }

  private maybeUpdatePlayers() {
    if (this.videoTimelineSnap == null) {
      return;
    }
    const timelineClips = this.videoTimelineSnap.getTimelineClips();

    const videoIdsToNeed: Record<VideoId, VideoTimelineClip> = {};
    for (const timelineClip of timelineClips) {
      if (timelineClip.end < this.time) {
        continue;
      }
      if (timelineClip.start + ADVANCE_TIME < this.time) {
        continue;
      }
      videoIdsToNeed[timelineClip.clip.videoId] = timelineClip;
    }

    const videoIdsToCreate = new Set<VideoId>();
    for (const videoId of Object.keys(videoIdsToNeed)) {
      if (this.playerMap.has(videoId)) {
        continue;
      }
      videoIdsToCreate.add(videoId);
    }

    for (const videoId of videoIdsToCreate) {
      const timelineClip = videoIdsToNeed[videoId];
      const player =
        RenderablePlayerFactory.createFromTimelineClip(timelineClip);
      this.playerMap.set(videoId, { player, timelineClip });
    }

    const videoIdsToRemove = new Set<VideoId>();
    for (const videoId of this.playerMap.keys()) {
      if (videoIdsToNeed[videoId]) {
        continue;
      }
      videoIdsToRemove.add(videoId);
    }

    for (const videoId of videoIdsToRemove) {
      const entry = this.playerMap.get(videoId);
      entry?.player.destroy();
      this.playerMap.delete(videoId);
    }
  }

  private getCurrentEntry() {
    if (this.videoTimelineSnap == null) {
      return null;
    }
    let foundEntry;
    for (const [_, entry] of this.playerMap.entries()) {
      const { timelineClip } = entry;
      if (this.time >= timelineClip.start && this.time < timelineClip.end) {
        foundEntry = entry;
        break;
      }
    }
    if (!foundEntry) {
      return null;
    }
    return foundEntry;
  }

  get isPlaying() {
    return this._isPlaying;
  }

  // load() {
  //   this.ensurePlayer();
  // }

  // play() {
  //   if (this.isPlaying) {
  //     return;
  //   }
  //   this._isPlaying = true;
  //   this.ensurePlayer();
  //   this.currentPlayer?.play();
  // }

  // pause() {
  //   if (!this.isPlaying) {
  //     return;
  //   }
  //   this._isPlaying = false;
  //   this.ensurePlayer();
  //   this.currentPlayer?.pause();
  // }

  // seek(time: number) {
  //   const newTimelineClip = this.videoTimelineSnap.findClipByTime(time);
  //   if (!newTimelineClip) {
  //     console.warn(`No video clip for time "${time}"`);
  //     return;
  //   }

  //   const inClipTime = time - newTimelineClip.start;

  //   if (this.currentIndex === newTimelineClip.index) {
  //     this.maybeSeekCurrentPlayer(inClipTime);
  //     return;
  //   }

  //   const wasPlaying = this.isPlaying;
  //   if (wasPlaying) {
  //     this.pause();
  //   }

  //   this.ensurePlayer({ newIndex: newTimelineClip.index });
  //   this.maybeSeekCurrentPlayer(inClipTime);

  //   if (wasPlaying) {
  //     this.play();
  //   }
  // }

  getFrame(): VideoFrame | null {
    const entry = this.getCurrentEntry();
    if (!entry) {
      return null;
    }

    const { player, timelineClip } = entry;
    player.updateFrame();

    return {
      renderSource: player.createRenderSource(),
      timelineClip,
      offset: {
        offsetX: timelineClip.clip.offsetX,
        offsetY: timelineClip.clip.offsetY,
      },
    };
  }

  // private ensurePlayer({ newIndex }: { newIndex?: number } = {}) {
  //   const hasAnyPlayer = this.currentIndex != null;
  //   const isNewIndex = newIndex != null && this.currentIndex !== newIndex;
  //   const shouldUpdate = !hasAnyPlayer || isNewIndex;
  //   if (!shouldUpdate) {
  //     return;
  //   }

  //   const newCurrentIndex =
  //     newIndex != null
  //       ? newIndex
  //       : this.currentIndex != null
  //         ? this.currentIndex
  //         : 0;
  //   const newNextIndex = newCurrentIndex + 1;
  //   const isNewCurrentNext = this.currentIndex === newCurrentIndex - 1;

  //   const newCurrentTimelineClip =
  //     this.videoTimelineSnap.getTimelineClips()[newCurrentIndex];

  //   if (!newCurrentTimelineClip) {
  //     console.warn('No new current clip for index', newCurrentIndex);
  //     return;
  //   }
  //   const newNextTimelineClip =
  //     this.videoTimelineSnap.getTimelineClips()[newNextIndex];

  //   this.maybeDestroyCurrentPlayer();

  //   if (isNewCurrentNext && this.nextPlayer) {
  //     this.currentPlayer = this.nextPlayer;
  //     if (this.isPlaying) {
  //       this.currentPlayer.play();
  //     }
  //   } else {
  //     this.maybeDestroyNextPlayer();
  //     this.currentPlayer = RenderablePlayerFactory.createFromTimelineClip(
  //       newCurrentTimelineClip,
  //     );
  //   }

  //   this.currentPlayer.ended.addListenerOnce(this.onPlayerEnded);
  //   this.currentIndex = newCurrentIndex;
  //   this.currentTimelineClip = newCurrentTimelineClip;

  //   if (newNextTimelineClip) {
  //     this.nextPlayer =
  //       RenderablePlayerFactory.createFromTimelineClip(newNextTimelineClip);
  //   }

  //   this.clipChanged.emit(newCurrentTimelineClip);
  // }

  // private maybeDestroyCurrentPlayer() {
  //   if (this.currentPlayer) {
  //     this.currentPlayer.destroy();
  //     this.currentPlayer = undefined;
  //     this.currentTimelineClip = undefined;
  //   }
  // }

  // private maybeDestroyNextPlayer() {
  //   if (this.nextPlayer) {
  //     this.nextPlayer.destroy();
  //     this.nextPlayer = undefined;
  //   }
  // }

  // private maybeSeekCurrentPlayer(inClipTime: number) {
  //   this.currentPlayer?.seek(inClipTime);
  // }

  // private onPlayerEnded = () => {
  //   console.log('onPlayerEnded');
  //   if (this.currentIndex == null) {
  //     throw new Error('A player must already exist');
  //   }
  //   const newIndex = this.currentIndex + 1;

  //   const wasPlaying = this.isPlaying;
  //   if (wasPlaying) {
  //     this.pause();
  //   }

  //   this.ensurePlayer({ newIndex });

  //   if (wasPlaying) {
  //     this.play();
  //   }
  // };
}
