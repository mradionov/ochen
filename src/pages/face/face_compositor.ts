import {
  EYEBROWS,
  FACE_ANCHOR,
  KEY_LANDMARK_POSITION,
  LEFT_EYE,
  MOUTH,
  RIGHT_EYE,
} from './face_landmark_indices';
import type { KeyLandmark } from './face_recording';
import type { FaceStates } from './face_states';

type Vec2 = [number, number];

function lm(landmarks: KeyLandmark[], idx: number, sx: number, sy: number): Vec2 {
  const kp = landmarks[KEY_LANDMARK_POSITION[idx]];
  return [kp[0] * sx, kp[1] * sy];
}

function mid(a: Vec2, b: Vec2): Vec2 {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

function dist(a: Vec2, b: Vec2): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

function angle(from: Vec2, to: Vec2): number {
  return Math.atan2(to[1] - from[1], to[0] - from[0]);
}

export class FaceCompositor {
  draw(
    ctx: CanvasRenderingContext2D,
    landmarks: KeyLandmark[],
    states: FaceStates,
    scaleX: number,
    scaleY: number,
  ) {
    const $ = (idx: number): Vec2 => lm(landmarks, idx, scaleX, scaleY);

    const noseTip    = $(FACE_ANCHOR.NOSE_TIP);
    const forehead   = $(FACE_ANCHOR.FOREHEAD);
    const chin       = $(FACE_ANCHOR.CHIN);
    const leftFace   = $(FACE_ANCHOR.LEFT_FACE);
    const rightFace  = $(FACE_ANCHOR.RIGHT_FACE);

    const leftEyeOuter  = $(LEFT_EYE.OUTER);
    const leftEyeInner  = $(LEFT_EYE.INNER);
    const leftEyeTop    = $(LEFT_EYE.TOP);
    const leftEyeBottom = $(LEFT_EYE.BOTTOM);

    const rightEyeOuter  = $(RIGHT_EYE.OUTER);
    const rightEyeInner  = $(RIGHT_EYE.INNER);
    const rightEyeTop    = $(RIGHT_EYE.TOP);
    const rightEyeBottom = $(RIGHT_EYE.BOTTOM);

    const mouthLeft        = $(MOUTH.LEFT_CORNER);
    const mouthRight       = $(MOUTH.RIGHT_CORNER);
    const mouthUpperTop    = $(MOUTH.UPPER_TOP);
    const mouthLowerBottom = $(MOUTH.LOWER_BOTTOM);

    const leftBrowMid  = $(EYEBROWS.LEFT_MID);
    const rightBrowMid = $(EYEBROWS.RIGHT_MID);

    const faceCenter = mid(leftFace, rightFace);
    const faceW = dist(leftFace, rightFace);
    const faceH = dist(forehead, chin);

    // Head
    ctx.beginPath();
    ctx.ellipse(
      faceCenter[0], faceCenter[1],
      faceW * 0.58, faceH * 0.56,
      states.headTilt, 0, Math.PI * 2,
    );
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Eyes — left eye outer is on screen-right (temple side), inner is on screen-left
    this.drawEye(ctx, leftEyeOuter, leftEyeInner, leftEyeTop, leftEyeBottom);
    this.drawEye(ctx, rightEyeInner, rightEyeOuter, rightEyeTop, rightEyeBottom);

    // Brows
    this.drawBrow(ctx, leftEyeOuter, leftEyeInner, leftBrowMid, faceW);
    this.drawBrow(ctx, rightEyeInner, rightEyeOuter, rightBrowMid, faceW);

    // Nose — two small dots
    const nd = faceW * 0.04;
    ctx.fillStyle = 'black';
    for (const ox of [-nd, nd]) {
      ctx.beginPath();
      ctx.arc(noseTip[0] + ox, noseTip[1] + nd * 0.5, faceW * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mouth
    this.drawMouth(ctx, mouthLeft, mouthRight, mouthUpperTop, mouthLowerBottom, states.mouthOpenness);
  }

  private drawEye(
    ctx: CanvasRenderingContext2D,
    outer: Vec2,
    inner: Vec2,
    top: Vec2,
    bottom: Vec2,
  ) {
    const center = mid(outer, inner);
    const eyeW = dist(outer, inner);
    const eyeH = Math.max(dist(top, bottom), 2);
    const tilt = angle(outer, inner);

    ctx.save();
    ctx.translate(center[0], center[1]);
    ctx.rotate(tilt);

    // Sclera
    ctx.beginPath();
    ctx.ellipse(0, 0, eyeW * 0.5, eyeH * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Iris
    const irisR = eyeW * 0.25;
    ctx.beginPath();
    ctx.arc(0, 0, irisR, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();

    // Specular highlight
    ctx.beginPath();
    ctx.arc(-irisR * 0.3, -irisR * 0.3, irisR * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    ctx.restore();
  }

  private drawBrow(
    ctx: CanvasRenderingContext2D,
    eyeA: Vec2,
    eyeB: Vec2,
    browMid: Vec2,
    faceW: number,
  ) {
    const browW = dist(eyeA, eyeB) * 1.1;
    const browH = faceW * 0.045;
    const tilt = angle(eyeA, eyeB);

    ctx.save();
    ctx.translate(browMid[0], browMid[1]);
    ctx.rotate(tilt);

    ctx.beginPath();
    ctx.roundRect(-browW * 0.5, -browH * 0.5, browW, browH, browH * 0.4);
    ctx.fillStyle = 'black';
    ctx.fill();

    ctx.restore();
  }

  private drawMouth(
    ctx: CanvasRenderingContext2D,
    left: Vec2,
    right: Vec2,
    upperTop: Vec2,
    lowerBottom: Vec2,
    openness: number,
  ) {
    const center = mid(left, right);
    const mouthW = dist(left, right);
    const mouthH = Math.max(dist(upperTop, lowerBottom), 2);
    const tilt = angle(left, right);

    ctx.save();
    ctx.translate(center[0], center[1]);
    ctx.rotate(tilt);

    if (openness < 0.04) {
      // Closed — bold line
      ctx.beginPath();
      ctx.moveTo(-mouthW * 0.5, 0);
      ctx.lineTo(mouthW * 0.5, 0);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      // Dark cavity
      ctx.beginPath();
      ctx.ellipse(0, 0, mouthW * 0.5, mouthH * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#111';
      ctx.fill();

      // Teeth — clipped to mouth outline
      if (openness > 0.08) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, 0, mouthW * 0.5, mouthH * 0.5, 0, 0, Math.PI * 2);
        ctx.clip();
        const teethH = mouthH * 0.35;
        ctx.fillStyle = 'white';
        ctx.fillRect(-mouthW * 0.45, -teethH * 0.5, mouthW * 0.9, teethH);
        ctx.restore();
      }

      // Outline on top
      ctx.beginPath();
      ctx.ellipse(0, 0, mouthW * 0.5, mouthH * 0.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.restore();
  }
}
