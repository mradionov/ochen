export class VideoRecorder {
  rec: MediaRecorder | undefined;

  start(renderCanvas: HTMLCanvasElement) {
    this.renderCanvas = renderCanvas;

    this.recordCanvas = document.createElement('canvas');
    this.recordCanvas.width = 1920;
    this.recordCanvas.height = 1920;

    this.rctx = this.recordCanvas.getContext('2d');

    const fps = 48;
    const stream = this.recordCanvas.captureStream(fps);

    const rec = new MediaRecorder(stream, {
      mimeType: pickMime(),
      videoBitsPerSecond: 30_000_000,
    });

    const chunks = [];
    rec.ondataavailable = (e) => {
      e.data.size && chunks.push(e.data);

      //   if (chunks.length >= 60) {
      //     // ~60 seconds
      //     saveChunk(chunks);
      //     chunks = [];
      //   }
    };

    rec.onstop = async () => {
      const blob = new Blob(chunks, { type: rec.mimeType });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'canvas.webm';
      a.click();

      URL.revokeObjectURL(url);
    };

    rec.start(1000);

    this.rec = rec;
  }

  update() {
    if (!this.rctx) return;

    this.rctx.imageSmoothingEnabled = false; // important for edges
    this.rctx.drawImage(
      this.renderCanvas,
      0,
      0,
      this.recordCanvas.width,
      this.recordCanvas.height,
    );
  }

  stop() {
    this.rec?.stop();
  }
}

function pickMime() {
  const candidates = ['video/webm;codecs=vp8', 'video/mp4;codecs="hvc1"'];
  return candidates.find(MediaRecorder.isTypeSupported) || '';
}
