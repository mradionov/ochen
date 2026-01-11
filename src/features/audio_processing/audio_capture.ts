export type AudioCaptureData = {
  data: Uint8Array<ArrayBuffer>;
  sampleRate: number;
  fftSize: number;
  bufferLength: number;
};

export class AudioCapture {
  private audioCtx: AudioContext;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array<ArrayBuffer>;
  private fftSize = 2048;
  // private fftSize = 16384;
  // private fftSize = 32768;
  // private sampleRate = 44100;

  constructor() {}

  async connectStream() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 2,
        sampleRate: 48000,
      },
    });

    console.log(stream);

    const { audioCtx, analyser } = await this.maybeCreate();

    const src = audioCtx.createMediaStreamSource(stream);

    src.connect(analyser);
    // src.connect(audioCtx.destination);
  }

  async connectElement(audio: HTMLAudioElement) {
    const { audioCtx, analyser } = await this.maybeCreate();

    const src = audioCtx.createMediaElementSource(audio);

    src.connect(analyser);
    src.connect(audioCtx.destination);
  }

  async maybeCreate() {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
      // await this.audioCtx.suspend();
    }
    if (!this.analyser) {
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = this.fftSize;

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.dataArray = dataArray;
    }

    return {
      audioCtx: this.audioCtx,
      analyser: this.analyser,
      dataArray: this.dataArray,
    };
  }

  async start() {
    return this.audioCtx.resume();
  }

  async stop() {
    return this.audioCtx.suspend();
  }

  update(): AudioCaptureData | undefined {
    if (!this.analyser) {
      return;
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    return {
      data: this.dataArray,
      sampleRate: this.audioCtx.sampleRate,
      fftSize: this.fftSize,
      bufferLength: this.dataArray.length,
    };
  }
}
