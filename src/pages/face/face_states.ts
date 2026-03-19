import {
  EYEBROWS,
  FACE_ANCHOR,
  KEY_LANDMARK_POSITION,
  LEFT_EYE,
  MOUTH,
  RIGHT_EYE,
} from './face_landmark_indices';
import type { KeyLandmark } from './face_recording';

export type FaceStates = {
  mouthOpenness: number;   // 0-1, lip gap / face height
  mouthWidth: number;      // 0-1, corner distance / face height
  eyeOpennessLeft: number;  // 0-1
  eyeOpennessRight: number; // 0-1
  browRaiseLeft: number;    // 0-1, brow-to-eye-top / face height
  browRaiseRight: number;   // 0-1
  faceCenter: { x: number; y: number };  // nose tip, in recording pixel space
  faceScale: number;        // eye-to-eye distance in pixels
  headTilt: number;         // radians
};

function get(landmarks: KeyLandmark[], landmarkIdx: number): KeyLandmark {
  return landmarks[KEY_LANDMARK_POSITION[landmarkIdx]];
}

function dist(a: KeyLandmark, b: KeyLandmark): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

function angle(a: KeyLandmark, b: KeyLandmark): number {
  return Math.atan2(b[1] - a[1], b[0] - a[0]);
}

export function deriveFaceStates(landmarks: KeyLandmark[]): FaceStates {
  const forehead = get(landmarks, FACE_ANCHOR.FOREHEAD);
  const chin = get(landmarks, FACE_ANCHOR.CHIN);
  const noseTip = get(landmarks, FACE_ANCHOR.NOSE_TIP);
  const leftEyeOuter = get(landmarks, LEFT_EYE.OUTER);
  const rightEyeOuter = get(landmarks, RIGHT_EYE.OUTER);

  const faceHeight = dist(forehead, chin);

  const mouthUpperTop = get(landmarks, MOUTH.UPPER_TOP);
  const mouthLowerBottom = get(landmarks, MOUTH.LOWER_BOTTOM);
  const mouthLeftCorner = get(landmarks, MOUTH.LEFT_CORNER);
  const mouthRightCorner = get(landmarks, MOUTH.RIGHT_CORNER);
  const leftEyeTop = get(landmarks, LEFT_EYE.TOP);
  const leftEyeBottom = get(landmarks, LEFT_EYE.BOTTOM);
  const rightEyeTop = get(landmarks, RIGHT_EYE.TOP);
  const rightEyeBottom = get(landmarks, RIGHT_EYE.BOTTOM);
  const leftBrowMid = get(landmarks, EYEBROWS.LEFT_MID);
  const rightBrowMid = get(landmarks, EYEBROWS.RIGHT_MID);

  const norm = (d: number) => (faceHeight > 0 ? d / faceHeight : 0);

  return {
    mouthOpenness: norm(dist(mouthUpperTop, mouthLowerBottom)),
    mouthWidth: norm(dist(mouthLeftCorner, mouthRightCorner)),
    eyeOpennessLeft: norm(dist(leftEyeTop, leftEyeBottom)),
    eyeOpennessRight: norm(dist(rightEyeTop, rightEyeBottom)),
    browRaiseLeft: norm(dist(leftBrowMid, leftEyeTop)),
    browRaiseRight: norm(dist(rightBrowMid, rightEyeTop)),
    faceCenter: { x: noseTip[0], y: noseTip[1] },
    faceScale: dist(leftEyeOuter, rightEyeOuter),
    headTilt: angle(leftEyeOuter, rightEyeOuter),
  };
}
