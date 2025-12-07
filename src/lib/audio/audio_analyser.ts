interface AudioInfoData {
  sub: number;
  bass: number;
  lowMid: number;
  mid: number;
  highMid: number;
  treble: number;
  noise: number;
  wideBass: number;
  wideMid: number;
  wideTreble: number;
}

const emptyData: AudioInfoData = Object.freeze<AudioInfoData>({
  sub: 0,
  bass: 0,
  lowMid: 0,
  mid: 0,
  highMid: 0,
  treble: 0,
  noise: 0,
  wideBass: 0,
  wideMid: 0,
  wideTreble: 0,
});

export interface AudioInfo {
  raw: AudioInfoData;
  norm: AudioInfoData;
  isBeat: boolean;
}

export class AudioAnalyser {
  private lastInfo: AudioInfo;

  process(data: Uint8Array<ArrayBuffer>, sampleRate: number): AudioInfo {
    // const bass = this.bandEnergy(data, 20, 250, sampleRate);
    // const mid = this.bandEnergy(data, 250, 2000, sampleRate);
    // const treble = this.bandEnergy(data, 2000, 8000, sampleRate);

    // const

    // const sub = this.bandEnergy(data, 20, 60, sampleRate);
    // const bass = this.bandEnergy(data, 60, 140, sampleRate);
    // const lowMid = this.bandEnergy(data, 140, 400, sampleRate);
    // const mid = this.bandEnergy(data, 400, 1200, sampleRate);
    // const highMid = this.bandEnergy(data, 1200, 5000, sampleRate);
    // const treble = this.bandEnergy(data, 5000, 10000, sampleRate);
    // const noise = this.bandEnergy(data, 10000, 20000, sampleRate);

    const config: Record<string, [number, number]> = {
      wideBass: [20, 250],
      wideMid: [250, 2000],
      wideTreble: [2000, 8000],
      sub: [20, 60],
      bass: [60, 140],
      lowMid: [140, 400],
      mid: [400, 1200],
      hightMid: [1200, 5000],
      treble: [5000, 10000],
      noise: [10000, 20000],
    };

    const rawData = Object.assign({}, emptyData);
    const normData = Object.assign({}, emptyData);

    Object.keys(config).forEach((key) => {
      const bandLow = config[key][0];
      const bandHigh = config[key][1];

      const raw = this.bandEnergy(data, bandLow, bandHigh, sampleRate);
      const norm = raw / 255;

      rawData[key] = raw;
      normData[key] = norm;
    });

    const isBeat = this.isBeat(rawData.bass / 255);

    const info = {
      raw: rawData,
      norm: normData,
      isBeat,
    };

    this.lastInfo = info;

    return info;
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
