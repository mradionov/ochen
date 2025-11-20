export interface AudioInfo {
  bass: number;
  mid: number;
  treble: number;
  isBeat: boolean;
}

export class AudioAnalyser {
  private lastBass = 0;
  private lastMid = 0;
  private lastTreble = 0;

  process(data: Uint8Array<ArrayBuffer>, sampleRate: number): AudioInfo {
    const bass = this.bandEnergy(data, 20, 250, sampleRate);
    const mid = this.bandEnergy(data, 250, 2000, sampleRate);
    const treble = this.bandEnergy(data, 2000, 8000, sampleRate);

    const normBass = bass / 255;
    const normMid = mid / 255;
    const normTreble = treble / 255;

    const isBeat = this.isBeat(normBass);

    return {
      bass: normBass,
      mid: normMid,
      treble: normTreble,
      isBeat,
    };
  }

  private bandEnergy(
    data: Uint8Array<ArrayBuffer>,
    bandLow: number,
    bandHigh: number,
    sampleRate: number,
  ) {
    const nyquist = sampleRate / 2;
    const lowIndex = Math.floor((bandLow / nyquist) * data.length);
    const highIndex = Math.floor((bandHigh / nyquist) * data.length);

    let sum = 0;
    for (let i = lowIndex; i <= highIndex; i++) sum += data[i];
    return sum / (highIndex - lowIndex + 1);
  }

  private isBeat(currentBass: number) {
    const isBeat = currentBass > this.lastBass * 1.3 && currentBass > 0.2;
    this.lastBass = currentBass * 0.9 + this.lastBass * 0.1; // decaying memory
    return isBeat;
  }
}
