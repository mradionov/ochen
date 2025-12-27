import { defaults } from './defaults';
import { Subject } from './subject';

type RenderLoopOptions = {
  deltaTimeLimit?: number;
  fps?: number;
};

type State = 'idle' | 'working' | 'stopRequested';

export class RenderLoop {
  readonly tick = new Subject<{ deltaTime: number; lastTime: number }>();
  readonly options: RenderLoopOptions;
  private lastTimestamp: number | undefined;
  private state: State = 'idle';

  constructor(argOptions: RenderLoopOptions = {}) {
    this.options = defaults(argOptions, {
      deltaTimeLimit: 1,
      fps: 60,
    });
  }

  start() {
    if (this.state !== 'idle' && this.state !== 'stopRequested') {
      return;
    }

    this.state = 'working';

    this.loop();
  }

  // WARNING: a couple of already queued callbacks might still fire after stop
  stop() {
    if (this.state !== 'working') {
      return;
    }

    this.state = 'stopRequested';
  }

  readonly loop = (timestamp = null) => {
    if (this.state === 'idle') {
      return;
    }

    if (this.state === 'stopRequested') {
      this.state = 'idle';
      return;
    }

    const idealDeltaTime = this.getIdealDeltaTime();
    // For the very first run loop() is called from the code and timestamp is
    // not known. On the second call loop() is called by requestAnimationFrame,
    // which also provides a timestamp.
    // Use ideal fixed delta value for the first run.
    let deltaTime = idealDeltaTime;
    if (timestamp !== null) {
      // Timestamp is originally in milliseconds, convert to seconds
      const deltaTimestamp = timestamp - this.lastTimestamp;
      if (Math.round(this.getFpsInterval()) - Math.round(deltaTimestamp) > 2) {
        window.requestAnimationFrame(this.loop);
        return;
      }

      deltaTime = deltaTimestamp / 1000;

      // If delta is too large, we must have resumed from stop() or breakpoint.
      // Use ideal default delta only for this frame.
      if (deltaTime > this.options.deltaTimeLimit) {
        deltaTime = idealDeltaTime;
      }
    }

    this.lastTimestamp = timestamp;

    const lastTime = timestamp / 1000;

    this.tick.emit({ deltaTime, lastTime });

    window.requestAnimationFrame(this.loop);
  };

  getFpsInterval() {
    return 1000 / this.options.fps;
  }

  getIdealDeltaTime() {
    return 1 / this.options.fps;
  }
}
