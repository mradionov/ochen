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

export class FaceOverlayEffectRenderer implements EffectRenderer<'faceOverlay'> {
  render({ ctx, width, height }: EffectRendererContext, config: EffectConfig<'faceOverlay'>) {
    const { faces, videoWidth, videoHeight } = faceDetectionStore;
    if (faces.length === 0) return;

    const dotRadius = config.dotRadius ?? 3;
    const color = config.color ?? '#00ffcc';
    const mirrored = config.mirrored ?? false;
    const cols = Math.max(1, Math.round(config.tileCols ?? 1));
    const rows = Math.max(1, Math.round(config.tileRows ?? 1));
    const tiled = cols > 1 || rows > 1;

    // Scale dot radius down proportionally when tiled
    const scaledRadius = tiled ? dotRadius / Math.max(cols, rows) : dotRadius;
    const tileW = width / cols;
    const tileH = height / rows;

    // Emit a dot at (cx, cy) in full-canvas space, accounting for tile + mirror
    const drawDot = (cx: number, cy: number) => {
      // In tiled mode, cx/cy maps into a single tile cell; replicate across all cells
      const baseTileX = tiled ? cx / cols : cx;
      const baseTileY = tiled ? cy / rows : cy;

      const colCount = tiled ? cols : 1;
      const rowCount = tiled ? rows : 1;

      for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < colCount; col++) {
          const tx = tiled ? baseTileX + col * tileW : baseTileX;
          const ty = tiled ? baseTileY + row * tileH : baseTileY;

          if (mirrored) {
            const lx = Math.min(tx, width - tx);
            ctx.beginPath();
            ctx.arc(lx, ty, scaledRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(width - lx, ty, scaledRadius, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(tx, ty, scaledRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = color;
    ctx.globalAlpha = 1;

    // Bounding box + label — only in plain (non-tiled, non-mirrored) mode
    if (!mirrored && !tiled) {
      ctx.font = '7px monospace';
      ctx.textBaseline = 'bottom';

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
        ctx.fillStyle = color;
        ctx.fillText(label, tl.x, tl.y - 2);

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 8;
      }
    }

    for (const face of faces) {
      for (const lm of face.landmarks) {
        const p = videoToCanvas(lm.x, lm.y, videoWidth, videoHeight, width, height);
        drawDot(p.x, p.y);
      }
    }

    ctx.restore();
  }
}
