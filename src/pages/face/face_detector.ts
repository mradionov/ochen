import * as mpFaceDetection from '@mediapipe/face_detection';
import * as faceDetection from '@tensorflow-models/face-detection';

export class FaceDetector {
  static async createDetector() {
    return faceDetection.createDetector(
      faceDetection.SupportedModels.MediaPipeFaceDetector,
      {
        runtime: 'mediapipe',
        modelType: 'short',
        maxFaces: 1,
        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@${
          mpFaceDetection.VERSION
        }`,
      },
    );
  }
}
