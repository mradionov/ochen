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
    for (const [, entry] of this.playerMap.entries()) {
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

}
