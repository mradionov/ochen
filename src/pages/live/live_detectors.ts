import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';

tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`,
);

// Chrome Shape Detection API
export type ChromeFaceLandmarkType = 'eye' | 'mouth' | 'nose';
export type ChromeFaceLandmark = {
  type: ChromeFaceLandmarkType;
  locations: Array<{ x: number; y: number }>;
};
export type ChromeDetectedFace = {
  boundingBox: DOMRectReadOnly;
  landmarks: ChromeFaceLandmark[];
};

interface ChromeFaceDetectorAPI {
  detect(source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): Promise<ChromeDetectedFace[]>;
}

export function isChromeFaceDetectorSupported(): boolean {
  return 'FaceDetector' in window;
}

export function createChromeFaceDetector(): ChromeFaceDetectorAPI | null {
  if (!isChromeFaceDetectorSupported()) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
}

// Pose detection (TF.js MoveNet)
export type PoseDetector = poseDetection.PoseDetector;

let poseDetectorPromise: Promise<PoseDetector> | null = null;

export function loadPoseDetector(): Promise<PoseDetector> {
  if (!poseDetectorPromise) {
    poseDetectorPromise = poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING },
    );
  }
  return poseDetectorPromise;
}

export async function disposePoseDetector(): Promise<void> {
  if (!poseDetectorPromise) return;
  const detector = await poseDetectorPromise;
  poseDetectorPromise = null;
  detector.dispose();
}
