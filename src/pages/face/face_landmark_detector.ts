import * as mpFaceMesh from '@mediapipe/face_mesh';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

export type FaceLandmarks = Array<{ x: number; y: number; z: number }>;

export class FaceLandmarkDetector {
  static async createDetector() {
    return faceLandmarksDetection.createDetector(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      {
        runtime: 'mediapipe',
        maxFaces: 1,
        refineLandmarks: false,
        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${mpFaceMesh.VERSION}`,
      },
    );
  }
}
