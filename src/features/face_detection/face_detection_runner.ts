import { faceDetectionStore } from './face_detection_store';

// Chrome Shape Detection API types
interface FaceDetectorResult {
  boundingBox: DOMRectReadOnly;
  landmarks: Array<{
    type: string;
    locations: Array<{ x: number; y: number }>;
  }>;
}

interface FaceDetectorConstructor {
  new (options?: { fastMode?: boolean; maxDetectedFaces?: number }): {
    detect(source: HTMLVideoElement): Promise<FaceDetectorResult[]>;
  };
}

declare const FaceDetector: FaceDetectorConstructor | undefined;

export function isFaceDetectorAvailable(): boolean {
  return typeof FaceDetector !== 'undefined';
}

export function startFaceDetectionLoop(getVideo: () => HTMLVideoElement | null): () => void {
  if (!isFaceDetectorAvailable()) {
    console.warn('FaceDetector API not available (Chrome only)');
    return () => {};
  }

  const detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 4 });
  let running = true;

  const captureCanvas = document.createElement('canvas');
  const captureCtx = captureCanvas.getContext('2d')!;
  const CAPTURE_INTERVAL_MS = 15_000;
  const PADDING = 0.25; // extra space around the bounding box

  function captureFace(video: HTMLVideoElement, box: { x: number; y: number; width: number; height: number }) {
    const padX = box.width * PADDING;
    const padY = box.height * PADDING;
    const sx = Math.max(0, box.x - padX);
    const sy = Math.max(0, box.y - padY);
    const sw = Math.min(video.videoWidth - sx, box.width + padX * 2);
    const sh = Math.min(video.videoHeight - sy, box.height + padY * 2);

    captureCanvas.width = Math.round(sw);
    captureCanvas.height = Math.round(sh);
    captureCtx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);

    faceDetectionStore.capturedFaceUrl = captureCanvas.toDataURL('image/jpeg', 0.85);
    faceDetectionStore.capturedFaceAt = Date.now();
  }

  async function loop() {
    while (running) {
      const video = getVideo();
      if (video && video.readyState >= 2 && video.videoWidth > 0) {
        try {
          const results = await detector.detect(video);
          faceDetectionStore.videoWidth = video.videoWidth;
          faceDetectionStore.videoHeight = video.videoHeight;
          if (results.length > 0) faceDetectionStore.lastFaceSeenAt = Date.now();
          faceDetectionStore.faces = results.map(r => ({
            box: {
              x: r.boundingBox.x,
              y: r.boundingBox.y,
              width: r.boundingBox.width,
              height: r.boundingBox.height,
            },
            landmarks: r.landmarks.flatMap(lm =>
              lm.locations.map(loc => ({ x: loc.x, y: loc.y, type: lm.type })),
            ),
          }));

          // Capture a face crop every 30 seconds
          if (
            results.length > 0 &&
            Date.now() - faceDetectionStore.capturedFaceAt > CAPTURE_INTERVAL_MS
          ) {
            captureFace(video, faceDetectionStore.faces[0].box);
          }
        } catch {
          // silently skip failed frames
        }
      }
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
  }

  loop();
  return () => { running = false; };
}
