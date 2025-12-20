import { Subject } from '../../src2/lib/subject';

export class Timer {
  done = new Subject();
  timeLeft: number | null = null;

  constructor(public defaultTimeLeft: number | null = null) {
    this.defaultTimeLeft = defaultTimeLeft;
    this.timeLeft = defaultTimeLeft;
  }

  public reset(timeLeft?: number): this {
    if (timeLeft != null) {
      this.defaultTimeLeft = timeLeft;
    }
    this.timeLeft = this.defaultTimeLeft;

    return this;
  }

  public stop(): this {
    this.timeLeft = null;

    return this;
  }

  public update(deltaTime: number): void {
    if (this.timeLeft == null) {
      return;
    }

    this.timeLeft -= deltaTime;

    if (this.timeLeft < 0) {
      this.timeLeft = null;
      this.done.emit(null);
    }
  }

  public isActive(): boolean {
    return this.timeLeft !== null;
  }

  public isDone(): boolean {
    return this.timeLeft === null;
  }
}
