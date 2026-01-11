import type { AudioInfo } from '../../audio_processing/audio_analyser';
import type { Effect, EffectContext } from '../effect';
import type { EdgeEffectConfig } from '../effects_store';

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

// window.b = {
//   threshold: 0,
//   transparency: 255,
//   strength: 1,
//   dead: 0,
// };

export class EdgeEffect implements Effect<EdgeEffectConfig> {
  async apply(
    { ctx, width, height, lastTime }: EffectContext,
    config: EdgeEffectConfig,
    audioInfo?: AudioInfo,
  ) {
    const kernel = 'sobel';
    let threshold = window.b?.threshold ?? config.threshold ?? 0;
    let transparency = window.b?.transparency ?? config.transparency ?? 255;

    let strength = window.b?.strength ?? config.strength ?? 1;
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

    // console.log(transparency);

    // transparency = Math.max(50, transparency);

    // console.log(audioInfo.diff.wideTreble);

    // strength = 10;

    // console.log(strength);

    // console.log(audioInfo);

    // const frame = ctx.getImageData(0, 0, width, height);

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

    // posterizeGray(gray, 8);

<<<<<<< HEAD:src/features/renderer/effects/edge.ts
=======
    // gray = median3x3Gray(gray, width, height);
    // gray = edgePreserve3x3(gray, width, height);
    gray = box3x3Gray(gray, width, height);

    // const wobbleAmount = 0;
    const wobbleAmount = accentuateBand(audioInfo?.norm.hat, 2, 0.5, 0.6);

>>>>>>> main:src/lib/renderer/effects/edge.ts
    // console.log(wobbleAmount);
    // console.log(wobbleAmount);

    let gx, gy;
    switch (kernel) {
      // case 'prewitt':
      //   gx = [-1, 0, 1, -1, 0, 1, -1, 0, 1];
      //   gy = [-1, -1, -1, 0, 0, 0, 1, 1, 1];
      //   break;
      // case 'laplacian':
      //   gx = [0, 1, 0, 1, -4, 1, 0, 1, 0];
      //   gy = [0, 1, 0, 1, -4, 1, 0, 1, 0];
      //   break;
      case 'sobel':
      default:
        gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    }

    let S = 10; // 2..6 typical
    if (audioInfo) {
      S = Math.round(20 * accentuateBand(audioInfo.norm.wideBass, 4, 0.5, 0.8));
    }

    for (let y = S; y < height - S; y++) {
      for (let x = S; x < width - S; x++) {
        let i = (y * width + x) * 4;

        const pattern = (x + y) % 4; // 0–3
        // let v = mag;

        // only keep edges on some pixels

        // dst[i] = dst[i + 1] = dst[i + 2] = v;

        let px = 0,
          py = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const yy = y + ky * S;
            const xx = x + kx * S;
            const val = gray[yy * width + xx];
            // const val = gray[(y + ky) * width + (x + kx)];
            const k = (ky + 1) * 3 + (kx + 1);
            px += gx[k] * val;
            py += gy[k] * val;
          }
        }
        let mag = Math.hypot(px, py);
        // const dead = 5 * (audioInfo?.norm.noise ?? 1 * 2); // tune 5..30
        // mag = mag < dead ? 0 : mag - dead;

        mag *= strength;

        // if (threshold != null) {
        //   mag = mag > threshold ? mag : 0;
        // }

        // const stripeWidth = 12;
        // const stagger = (x + y + Math.floor(lastTime * 10)) % stripeWidth;
        // const intensity = mag * (stagger < stripeWidth / 2 ? 1 : 0.5);

        // console.log(lastTime);

        if (mag > threshold) {
          // const phase = (x + y) * 0.1 + lastTime;
          // const offsetX = Math.round(x + squareWave(phase) * wobbleAmount);
          // const offsetY = Math.round(
          //   y + squareWave(phase + 0.3) * wobbleAmount,
          // );

          // pixels
          const phase = (x + y) * 0.1 + lastTime * 1.5;
          const offsetX = Math.round(x + Math.sin(phase) * wobbleAmount * 12);
          const offsetY = Math.round(y + Math.cos(phase) * wobbleAmount * 12);

          // const snap = (Math.floor(lastTime * 10) % 3) - 1; // -1, 0, or +1
          // const offsetX = x + snap;
          // const offsetY = y + snap;

          if (
            offsetX < 0 ||
            offsetX >= width ||
            offsetY < 0 ||
            offsetY >= height
          )
            continue;

          if (wobbleAmount > 0.5) {
            //   // if (audioInfo?.isBeat) {
            i = (offsetY * width + offsetX) * 4;
          }
          // }
          // }
          // const val = Math.min(255, mag);

          let intensity = Math.min(255, mag);

          // if (pattern === 0 || pattern === 1) {
          //   // keep
          // } else {
          //   intensity = 0; // drop
          // }

          // const angle = Math.atan2(gy, gx); // between -π and π
          // const angleBand = Math.floor((angle + Math.PI) / (Math.PI / 6)); // 12 steps
          // const phase = (angleBand + Math.floor(lastTime * 4)) % 12;
          // const visible = phase < 6 ? 1 : 0.2;

          dst[i] = intensity;
          dst[i + 1] = intensity;
          dst[i + 2] = intensity;
          dst[i + 3] = transparency;
        }
      }
    }

<<<<<<< HEAD:src/features/renderer/effects/edge.ts
    const jej = accentuateBand(audioInfo?.diff.treble, 3, 0.3, 0.7);
    const iterations = Math.round(jej);
=======
    // temporalGate(dst, width, height, 0.1, Math.floor(lastTime * 10));

    // applyStipple(dst, width, height, 0.3, Math.floor(lastTime * 10));

    pruneBySupport(dst, width, height, {
      edgeThr: 100 * (audioInfo?.norm.highMid ?? 1),
      minNeighbors: Math.round(4 * (audioInfo?.norm.hat ?? 1)),
    });

    // removeSmallEdgeComponents(dst, width, height, {
    //   threshold: 50 * (audioInfo?.norm.highMid ?? 1),
    //   minAreaRatio: 0.001 * (audioInfo?.norm.hat ?? 1), // tune this
    //   connectivity: 8,
    // });

    // const jej = accentuateBand(audioInfo.diff.treble, 3, 0.3, 0.7);
    // const iterations = Math.round(jej);
>>>>>>> main:src/lib/renderer/effects/edge.ts
    // console.log(iterations);

    // dilate(dst, width, height, 0);

    // const count = 200;
    // for (let i = 0; i < count; i++) {
    //   const idx = Math.floor(Math.random() * edgePixels.length);
    //   highlightedEdges.push(edgePixels[idx]);
    // }

    // for (const { x, y } of highlightedEdges) {
    //   ctx.fillStyle = 'cyan';
    //   ctx.beginPath();
    //   ctx.arc(x, y, 2.5, 0, Math.PI * 2); // 2.5px radius
    //   ctx.fill();
    // }

    const ddd = new ImageData(dst, width, height);

    const im = await createImageBitmap(ddd);

    // ctx.fillStyle = 'rgba(0,0,0,0.1)';
    // ctx.fillRect(0, 0, width, height);

    // ctx.putImageData(ddd, 0, 0);

    // ctx.filter = `blur(3px)`;
    ctx.drawImage(im, 0, 0);
    // ctx.filter = '';
  }
}

function temporalGate(dst, w, h, keepProb /*0..1*/, phase = 0) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const v = dst[i];
      if (v === 0) continue;

      const n = (x * 1103515245 + y * 12345 + phase * 1013904223) >>> 0;
      const r = (n & 65535) / 65535;
      if (r > keepProb) dst[i] = dst[i + 1] = dst[i + 2] = 0;
    }
  }
}

function applyStipple(dst, w, h, amount /*0..1*/, seed = 1) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const v = dst[i];
      if (v === 0) continue;

      // cheap deterministic hash 0..1 (no Math.random)
      const n = (x * 374761393 + y * 668265263 + seed * 1442695041) >>> 0;
      const r = (n & 1023) / 1023; // 0..1

      // drop some edge pixels
      if (r < amount) dst[i] = dst[i + 1] = dst[i + 2] = 0;
    }
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

function dilate(dst, width, height, iterations = 1) {
  for (let it = 0; it < iterations; it++) {
    const copy = dst.slice();
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        let maxV = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const j = ((y + ky) * width + (x + kx)) * 4;
            maxV = Math.max(maxV, copy[j]);
          }
        }

        dst[i] = dst[i + 1] = dst[i + 2] = maxV;
      }
    }
  }
}

function erode(dst, width, height, iterations = 1) {
  for (let it = 0; it < iterations; it++) {
    const copy = dst.slice();
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        let minV = 255;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const j = ((y + ky) * width + (x + kx)) * 4;
            minV = Math.min(minV, copy[j]);
          }
        }

        dst[i] = dst[i + 1] = dst[i + 2] = minV;
      }
    }
  }
}

function posterizeGray(gray, levels = 8) {
  const out = new Uint8ClampedArray(gray.length);
  const step = 255 / (levels - 1);
  for (let i = 0; i < gray.length; i++) {
    out[i] = Math.round(gray[i] / step) * step;
  }
  return out;
}

function triangleWave(t: number) {
  return 2 * Math.abs((t % 1) - 0.5) - 1; // range: [-1, 1]
}

function squareWave(t: number) {
  return t % 1 < 0.5 ? -1 : 1;
}

function removeSmallEdgeComponents(
  dst,
  width,
  height,
  {
    threshold = 60, // edge pixel if dst[i] >= threshold
    minAreaRatio = 0.0005, // 0.05% of image area
    connectivity = 8, // 4 or 8
  } = {},
) {
  const n = width * height;
  const minArea = Math.max(1, Math.floor(n * minAreaRatio));

  // 0/1 mask of edge pixels
  const mask = new Uint8Array(n);
  for (let p = 0; p < n; p++) {
    const v = dst[p * 4]; // grayscale in R
    mask[p] = v >= threshold ? 1 : 0;
  }

  // visited marker
  const visited = new Uint8Array(n);

  // stack for flood fill (store linear indices)
  const stack = new Int32Array(n); // worst-case, big but fast
  const component = new Int32Array(n); // to record pixels of current component

  const neighbors4 = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  const neighbors8 = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  const neighbors = connectivity === 4 ? neighbors4 : neighbors8;

  for (let start = 0; start < n; start++) {
    if (!mask[start] || visited[start]) continue;

    // flood fill from start
    let sp = 0;
    let cp = 0;
    stack[sp++] = start;
    visited[start] = 1;

    while (sp > 0) {
      const idx = stack[--sp];
      component[cp++] = idx;

      const x = idx % width;
      const y = (idx / width) | 0;

      for (let k = 0; k < neighbors.length; k++) {
        const nx = x + neighbors[k][0];
        const ny = y + neighbors[k][1];
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

        const nidx = ny * width + nx;
        if (!mask[nidx] || visited[nidx]) continue;

        visited[nidx] = 1;
        stack[sp++] = nidx;
      }
    }

    // if component is too small, erase it from dst
    if (cp < minArea) {
      for (let i = 0; i < cp; i++) {
        const p = component[i] * 4;
        dst[p] = dst[p + 1] = dst[p + 2] = 0;
        // keep alpha as-is or zero it too:
        // dst[p + 3] = 0;
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

function median3x3Gray(gray, w, h) {
  const out = new Uint8ClampedArray(gray.length);
  const win = new Uint8Array(9);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let n = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          win[n++] = gray[(y + ky) * w + (x + kx)];
        }
      }
      win.sort(); // 9 items only
      out[y * w + x] = win[4]; // median
    }
  }
  return out;
}

function edgePreserve3x3(gray, w, h, sigma = 12) {
  const out = new Uint8ClampedArray(gray.length);
  const s2 = sigma * sigma;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const c = gray[y * w + x];
      let sum = 0,
        wsum = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const v = gray[(y + ky) * w + (x + kx)];
          const d = v - c;
          const ww = Math.exp(-(d * d) / s2);
          sum += v * ww;
          wsum += ww;
        }
      }
      out[y * w + x] = sum / wsum;
    }
  }
  return out;
}
