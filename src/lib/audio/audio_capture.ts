export class AudioCapture {
  private audioCtx: AudioContext;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array<ArrayBuffer>;

  constructor() {}

  async connect() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new AudioContext();
    await audioCtx.suspend();
    const src = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    // analyser.fftSize = 8192;
    // analyser.fftSize = 16384;
    src.connect(analyser);

    // src.connect(audioCtx.destination);

    this.analyser = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    this.dataArray = dataArray;
    this.audioCtx = audioCtx;
  }

  async start() {
    return this.audioCtx.resume();
  }

  async stop() {
    return this.audioCtx.suspend();
  }

  update() {
    this.analyser.getByteFrequencyData(this.dataArray);
    return { data: this.dataArray, bufferLength: this.dataArray.length };
  }
}
