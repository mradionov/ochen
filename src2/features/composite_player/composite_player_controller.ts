import { Subject } from '../../lib/subject';

export class CompositePlayerController {
  seeked = new Subject<number>();
  played = new Subject<{ video: boolean; audio: boolean }>();
  paused = new Subject<void>();
  toggledPlay = new Subject<void>();

  play({ video = true, audio = true } = {}) {
    this.played.emit({ video, audio });
  }

  pause() {
    this.paused.emit();
  }

  togglePlay() {
    this.toggledPlay.emit();
  }

  seek(newTime: number) {
    this.seeked.emit(newTime);
  }
}
