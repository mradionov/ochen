import { Subject } from '$lib/subject';

const EMIT_UPDATE_DELAY_SEC = 1;

export class RunningClock {
  private baseTimeSec = 0;
  private playStartTimeMs: number | undefined;
  private emitUpdateDeltaSec: number = 0;

  readonly timeUpdate = new Subject<{ time: number }>();

  get currentTime() {
    return this.currentTimeSec;
  }

  play() {
    if (this.isPlaying) {
      return;
    }
    this.playStartTimeMs = performance.now();
  }

  pause() {
    if (!this.isPlaying) {
      return;
    }
    this.baseTimeSec += this.elapsedTimeSec;
    this.playStartTimeMs = undefined;
    this.emitUpdateDeltaSec = 0;
    this.emitUpdate();
  }

  seek(timeSec: number) {
    this.baseTimeSec = timeSec;
    this.emitUpdateDeltaSec = 0;
    if (this.isPlaying) {
      this.playStartTimeMs = performance.now();
    }
    this.emitUpdate();
  }

  update({ deltaTime }: { deltaTime: number }) {
    if (!this.isPlaying) {
      return;
    }

    this.emitUpdateDeltaSec += deltaTime;
    if (this.emitUpdateDeltaSec > EMIT_UPDATE_DELAY_SEC) {
      this.emitUpdate();
      this.emitUpdateDeltaSec = 0;
    }
  }

  private get isPlaying() {
    return this.playStartTimeMs != null;
  }

  private get elapsedTimeSec() {
    if (!this.playStartTimeMs) {
      return 0;
    }
    const nowMs = performance.now();
    const elapsedMs = nowMs - this.playStartTimeMs;
    return elapsedMs / 1000;
  }

  private get currentTimeSec() {
    return this.baseTimeSec + this.elapsedTimeSec;
  }

  private emitUpdate() {
    this.timeUpdate.emit({ time: this.currentTimeSec });
  }
}
