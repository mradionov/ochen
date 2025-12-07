import type { AudioInfo } from '$lib/audio/audio_analyser';
import type { Effect, EffectContext } from '../effect';
import type { EdgeEffectConfig } from '../effects_map.svelte';

export class EdgeEffect implements Effect<EdgeEffectConfig> {
  async apply(
    { ctx, width, height, lastTime }: EffectContext,
    config: EdgeEffectConfig,
    audioInfo?: AudioInfo,
  ) {
    const kernel = 'sobel';
    let threshold = config.threshold ?? 0;
    let transparency = config.transparency ?? 0;

    let strength = config.strength ?? 1;
    if (audioInfo) {
      // if (audioInfo?.isBeat) {
      //   strength = 3.0;
      // }
      // strength += (1.0 - strength) * 0.1;
      strength = 0 + audioInfo.norm.wideTreble * 10;

      transparency = 0 + 300 * audioInfo.norm.wideBass;
      // threshold = 0 + 100 * (audioInfo.mid * 2);
    }

    // console.log(audioInfo);

    // const frame = ctx.getImageData(0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);

    const { data } = imageData;

    const srcData = data;

    const dst = new Uint8ClampedArray(srcData.length);

    const gray = new Uint8ClampedArray(width * height);
    for (let i = 0; i < width * height; i++) {
      const r = srcData[i * 4];
      const g = srcData[i * 4 + 1];
      const b = srcData[i * 4 + 2];
      gray[i] = 0.3 * r + 0.59 * g + 0.11 * b;
    }

    // const wobbleAmount = 4 * audioInfo?.mid;
    const wobbleAmount = 0;
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

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let i = (y * width + x) * 4;

        let px = 0,
          py = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const val = gray[(y + ky) * width + (x + kx)];
            const k = (ky + 1) * 3 + (kx + 1);
            px += gx[k] * val;
            py += gy[k] * val;
          }
        }
        let mag = Math.sqrt(px * px + py * py);

        mag *= strength;

        // if (threshold != null) {
        //   mag = mag > threshold ? mag : 0;
        // }

        // const stripeWidth = 12;
        // const stagger = (x + y + Math.floor(lastTime * 10)) % stripeWidth;
        // const intensity = mag * (stagger < stripeWidth / 2 ? 1 : 0.5);

        // console.log(lastTime);

        if (mag > threshold) {
          const phase = (x + y) * 0.1 + lastTime;
          const offsetX = Math.round(x + squareWave(phase) * wobbleAmount);
          const offsetY = Math.round(
            y + squareWave(phase + 0.3) * wobbleAmount,
          );

          // pixels
          // const phase = (x + y) * 0.1 + lastTime * 0.5;
          // const offsetX = Math.round(x + Math.sin(phase) * wobbleAmount * 2);
          // const offsetY = Math.round(y + Math.cos(phase) * wobbleAmount * 2);

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

          if (wobbleAmount > 1.9) {
            // if (audioInfo?.isBeat) {
            i = (offsetY * width + offsetX) * 4;
          }
          // }
          // }
          // const val = Math.min(255, mag);

          const intensity = Math.min(255, mag);

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

    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, 0, width, height);

    // ctx.putImageData(ddd, 0, 0);

    // ctx.filter = `blur(3px)`;
    ctx.drawImage(im, 0, 0);
    // ctx.filter = '';
  }
}

function triangleWave(t: number) {
  return 2 * Math.abs((t % 1) - 0.5) - 1; // range: [-1, 1]
}

function squareWave(t: number) {
  return t % 1 < 0.5 ? -1 : 1;
}
