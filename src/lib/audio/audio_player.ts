import type { AudioResolver } from '$lib/audio/audio_resolver';
import type { AudioClip } from '$lib/manifest/manifest.svelte';
import { Subject } from '$lib/subject';
import type { AudioTimelineClip } from './audio_timeline.svelte';

export class AudioPlayer {
  readonly ended = new Subject<void>();

  private constructor(readonly element: HTMLAudioElement) {
    this.load();
  }

  static create(clip: AudioClip, audioResolver: AudioResolver) {
    const element = audioResolver.createAudioElement(clip);
    return new AudioPlayer(element);
  }

  static createFromElement(element: HTMLAudioElement) {
    return new AudioPlayer(element);
  }

  static createFromPath(path: string) {
    const element = document.createElement('video');
    element.src = path;
    return this.createFromElement(element);
  }

  static createFromTimelineClip(timelineClip: AudioTimelineClip) {
    return this.createFromPath(timelineClip.clip.audioPath);
  }

  play() {
    void this.element.play();
  }

  pause() {
    this.element.pause();
  }

  seek(time: number) {
    this.element.currentTime = time;
  }

  destroy() {
    this.element.removeAttribute('src'); // empty source
    this.element.load();
    this.element.removeEventListener('ended', this.onElementEnded);
    this.ended.removeAllListeners();
  }

  private load() {
    this.element.currentTime = 0.01;
    this.element.addEventListener('ended', this.onElementEnded);
  }

  private onElementEnded = () => {
    this.ended.emit();
  };
}
