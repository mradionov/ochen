import { faceDetectionStore } from '../../../face_detection/face_detection_store';
import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

function videoToCanvas(
  vx: number,
  vy: number,
  videoW: number,
  videoH: number,
  canvasW: number,
  canvasH: number,
): { x: number; y: number } {
  const scale = Math.max(canvasW / videoW, canvasH / videoH);
  const dstX = (canvasW - videoW * scale) / 2;
  const dstY = (canvasH - videoH * scale) / 2;
  return { x: vx * scale + dstX, y: vy * scale + dstY };
}

function drawRings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  lastTime: number,
  color: string,
  scale = 1,
) {
  const RING_COUNT = 3;
  const PERIOD = 2.5; // seconds per full expansion
  const MAX_RADIUS = 18 * scale;

  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8 * scale;

  for (let r = 0; r < RING_COUNT; r++) {
    const phase = ((lastTime / PERIOD) + r / RING_COUNT) % 1;
    const radius = phase * MAX_RADIUS;
    const alpha = (1 - phase) * 0.85;
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 6 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Small solid centre dot
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, 1.5 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawConstellation(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  color: string,
  dotRadius: number,
  scale = 1,
) {
  const CONNECT_THRESHOLD = 60 * scale;

  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8 * scale;

  // Lines between nearby landmarks
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONNECT_THRESHOLD) {
        ctx.globalAlpha = (1 - dist / CONNECT_THRESHOLD) * 0.6;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
        ctx.stroke();
      }
    }
  }

  // Dots at each landmark
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 8;
  ctx.fillStyle = color;
  for (const p of points) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, dotRadius * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class FaceOverlayEffectRenderer implements EffectRenderer<'faceOverlay'> {
  render({ ctx, width, height, lastTime }: EffectRendererContext, config: EffectConfig<'faceOverlay'>) {
    const { faces, videoWidth, videoHeight } = faceDetectionStore;
    if (faces.length === 0) return;

    const dotRadius = config.dotRadius ?? 3;
    const color = config.color ?? '#00ffcc';
    const mirrored = config.mirrored ?? false;
    const cols = Math.max(1, Math.round(config.tileCols ?? 1));
    const rows = Math.max(1, Math.round(config.tileRows ?? 1));
    const tiled = cols > 1 || rows > 1;
    const style = config.style ?? 'rings';
    const tileScale = tiled ? 1 / Math.max(cols, rows) : 1;
    const tileW = width / cols;
    const tileH = height / rows;

    ctx.save();
    ctx.shadowColor = color;

    // Bounding box + label — only in plain mode
    if (!mirrored && !tiled) {
      ctx.font = '7px monospace';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = color;

      for (const face of faces) {
        const tl = videoToCanvas(face.box.x, face.box.y, videoWidth, videoHeight, width, height);
        const br = videoToCanvas(
          face.box.x + face.box.width,
          face.box.y + face.box.height,
          videoWidth,
          videoHeight,
          width,
          height,
        );
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.shadowBlur = 6;
        ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);

        const label = `x:${Math.round(face.box.x)} y:${Math.round(face.box.y)} ${Math.round(face.box.width)}×${Math.round(face.box.height)}`;
        ctx.globalAlpha = 0.9;
        ctx.shadowBlur = 4;
        ctx.fillText(label, tl.x, tl.y - 2);
      }
    }

    for (const face of faces) {
      // Map landmarks to canvas space
      const rawPoints = face.landmarks.map(lm =>
        videoToCanvas(lm.x, lm.y, videoWidth, videoHeight, width, height),
      );

      // For each tile cell (1×1 if not tiled)
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const points = rawPoints.map(p => ({
            x: tiled ? p.x / cols + col * tileW : p.x,
            y: tiled ? p.y / rows + row * tileH : p.y,
          }));

          const drawPoints = mirrored
            ? points.flatMap(p => {
                const lx = Math.min(p.x, width - p.x);
                return [{ x: lx, y: p.y }, { x: width - lx, y: p.y }];
              })
            : points;

          if (style === 'rings') {
            for (const p of drawPoints) {
              drawRings(ctx, p.x, p.y, lastTime, color, tileScale);
            }
          } else {
            drawConstellation(ctx, drawPoints, color, dotRadius, tileScale);
          }
        }
      }
    }

    ctx.restore();
  }
}
