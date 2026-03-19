import { KEY_LANDMARK_INDICES } from './face_landmark_indices';

// [x, y, z] — coordinates in original video pixel space
export type KeyLandmark = [number, number, number];

export type FaceRecordingFrame = {
  t: number; // seconds from recording start
  landmarks: KeyLandmark[]; // one entry per KEY_LANDMARK_INDICES, in order
};

export type FaceRecording = {
  version: 1;
  width: number; // video width at capture time (for coordinate normalization)
  height: number; // video height at capture time
  indices: number[]; // KEY_LANDMARK_INDICES snapshot — lets playback verify shape
  frames: FaceRecordingFrame[];
};

export function createFaceRecording(width: number, height: number): FaceRecording {
  return {
    version: 1,
    width,
    height,
    indices: [...KEY_LANDMARK_INDICES],
    frames: [],
  };
}

export function downloadFaceRecording(recording: FaceRecording) {
  const json = JSON.stringify(recording);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `face_recording_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
