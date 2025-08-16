export class AudioReader {
  ctx = null;

  async connect() {
    const stream = navigator.mediaDevices.getUserMedia({audio: true});
    this.ctx = new AudioContext();
  }
}
