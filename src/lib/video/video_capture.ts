export class VideoCapture {
  private video: HTMLVideoElement;

  async connect() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.srcObject = stream;
    video.playsInline = true;
    await video.play();

    this.video = video;

    return { video: this.video };
  }

  update() {
    return { video: this.video };
  }
}
