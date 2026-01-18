import type { AudioInfo } from '../../../audio_processing/audio_analyser';
import type {
  EffectRenderer,
  EffectRendererContext,
} from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class EdgeEffectRenderer implements EffectRenderer<'edge'> {
  async render(
    { ctx, width, height, lastTime }: EffectRendererContext,
    config: EffectConfig<'edge'>,
    audioInfo?: AudioInfo,
  ) {
    let threshold = config.threshold ?? 0;
    let transparency = config.transparency ?? 255;

    let strength = config.strength ?? 1;
    if (audioInfo) {
      const wideTreble = accentuateBand(audioInfo.norm.wideTreble, 2, 0.5, 0.6);
      // if (audioInfo?.isBeat) {
      //   strength = 3.0;
      // }
      // strength += (1.0 - strength) * 0.1;
      // strength = 0 + wideTreble * 8;
      strength = 0 + wideTreble * 1.5;
      // strength = 0 + audioInfo.diff.treble * 10;

      // const wideBass = accentuateBand(audioInfo.diff.wideBass, 2);
      const wideBass = audioInfo.norm.wideBass;

      // transparency = 255 - 255 * wideBass;
      transparency = 255 * wideBass;
      // transparency = 0 + 300 * audioInfo.diff.bass;
      // threshold = 0;

      const mid = accentuateBand(audioInfo.norm.lowMid, 4, 0.5, 0.8);
      threshold = 10 * mid;
    }

    const imageData = ctx.getImageData(0, 0, width, height);

    const { data } = imageData;

    const srcData = data;

    const dst = new Uint8ClampedArray(srcData.length);

    let gray = new Uint8ClampedArray(width * height);
    for (let i = 0; i < width * height; i++) {
      const r = srcData[i * 4];
      const g = srcData[i * 4 + 1];
      const b = srcData[i * 4 + 2];
      // gray[i] = 0.3 * r + 0.59 * g + 0.11 * b;
      gray[i] = (r + g + b) / 3;
    }

    gray = box3x3Gray(gray, width, height);

    const wobbleAmount = accentuateBand(audioInfo?.norm.hat, 2, 0.5, 0.6);

    const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    let S = 10; // 2..6 typical
    if (audioInfo) {
      S = Math.round(20 * accentuateBand(audioInfo.norm.wideBass, 4, 0.5, 0.8));
    }

    for (let y = S; y < height - S; y++) {
      for (let x = S; x < width - S; x++) {
        let i = (y * width + x) * 4;

        let px = 0,
          py = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const yy = y + ky * S;
            const xx = x + kx * S;
            const val = gray[yy * width + xx];
            const k = (ky + 1) * 3 + (kx + 1);
            px += gx[k] * val;
            py += gy[k] * val;
          }
        }
        let mag = Math.hypot(px, py);

        mag *= strength;

        if (mag > threshold) {
          // pixels
          const phase = (x + y) * 0.1 + lastTime * 1.5;
          const offsetX = Math.round(x + Math.sin(phase) * wobbleAmount * 12);
          const offsetY = Math.round(y + Math.cos(phase) * wobbleAmount * 12);

          if (
            offsetX < 0 ||
            offsetX >= width ||
            offsetY < 0 ||
            offsetY >= height
          )
            continue;

          if (wobbleAmount > 0.5) {
            i = (offsetY * width + offsetX) * 4;
          }

          let intensity = Math.min(255, mag);

          dst[i] = intensity;
          dst[i + 1] = intensity;
          dst[i + 2] = intensity;
          dst[i + 3] = transparency;
        }
      }
    }

    pruneBySupport(dst, width, height, {
      edgeThr: 100 * (audioInfo?.norm.highMid ?? 1),
      minNeighbors: Math.round(4 * (audioInfo?.norm.hat ?? 1)),
    });

    // Convert to preserve alpha
    const newImageData = new ImageData(dst, width, height);
    const imageBitmap = await createImageBitmap(newImageData);

    ctx.drawImage(imageBitmap, 0, 0);
  }
}

function pruneBySupport(dst, w, h, { edgeThr = 60, minNeighbors = 2 } = {}) {
  const copy = dst.slice();
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      const v = copy[i];
      if (v < edgeThr) continue;

      let count = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          if (kx === 0 && ky === 0) continue;
          const j = ((y + ky) * w + (x + kx)) * 4;
          if (copy[j] >= edgeThr) count++;
        }
      }
      if (count < minNeighbors) {
        dst[i] = dst[i + 1] = dst[i + 2] = 0;
      }
    }
  }
}

function box3x3Gray(gray, w, h) {
  const out = new Uint8ClampedArray(gray.length);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          sum += gray[(y + ky) * w + (x + kx)];
        }
      }
      out[y * w + x] = sum / 9;
    }
  }
  return out;
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

const smoothstep = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

function accentuateBand(x, gain = 2.5, lo = 0.5, hi = 0.6) {
  // window = 0 outside, 1 inside (with soft edges)
  const wIn = smoothstep(lo, lo + 0.05, x);
  const wOut = 1 - smoothstep(hi - 0.05, hi, x);
  const w = wIn * wOut;

  const mid = (lo + hi) * 0.5; // 0.55
  const boosted = mid + (x - mid) * gain; // increase slope around mid

  // blend: inside band use boosted, outside use linear
  return clamp01(x * (1 - w) + boosted * w);
}
