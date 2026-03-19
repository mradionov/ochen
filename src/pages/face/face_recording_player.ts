import type { FaceRecording, KeyLandmark } from './face_recording';

export class FaceRecordingPlayer {
  private readonly recording: FaceRecording;

  constructor(recording: FaceRecording) {
    this.recording = recording;
  }

  get duration(): number {
    const { frames } = this.recording;
    return frames.length > 0 ? frames[frames.length - 1].t : 0;
  }

  get width(): number {
    return this.recording.width;
  }

  get height(): number {
    return this.recording.height;
  }

  getLandmarksAtTime(t: number): KeyLandmark[] | null {
    const { frames } = this.recording;
    if (frames.length === 0) return null;

    // Binary search for the first frame at or after t
    let lo = 0;
    let hi = frames.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (frames[mid].t < t) lo = mid + 1;
      else hi = mid;
    }

    return frames[lo].landmarks;
  }

  static fromJSON(json: string): FaceRecordingPlayer {
    return new FaceRecordingPlayer(JSON.parse(json) as FaceRecording);
  }
}
