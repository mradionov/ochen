export type StoredFace = {
  box: { x: number; y: number; width: number; height: number };
  landmarks: Array<{ x: number; y: number; type: string }>;
};

export const faceDetectionStore: {
  faces: StoredFace[];
  videoWidth: number;
  videoHeight: number;
  capturedFaceUrl: string | null;
  capturedFaceAt: number;
  lastFaceSeenAt: number;
} = {
  faces: [],
  videoWidth: 1,
  videoHeight: 1,
  capturedFaceUrl: null,
  capturedFaceAt: 0,
  lastFaceSeenAt: 0,
};
