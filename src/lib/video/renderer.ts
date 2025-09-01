import { hexToRgb } from '../color.ts';
import { defaults } from '../defaults.ts';
import type { Effects } from '../manifest/manifest_reader.ts';

const DEFAULT_OPTIONS: RendererOptions = {
	width: 800,
	height: 800,
	offsetX: 'center',
	offsetY: 'center',
	effects: {}
};

type RendererOptions = {
	width: number;
	height: number;
	offsetX?: 'left' | 'center' | 'right' | number;
	offsetY?: 'top' | 'center' | 'bottom' | number;
	effects?: Effects;
};

export type Renderer = {
	$canvas: HTMLCanvasElement;
	updateFrame(video: HTMLVideoElement): void;
	setTintColor(tint: string): void;
};

export function createRenderer(argOptions: RendererOptions): Renderer {
	const options = defaults(DEFAULT_OPTIONS, argOptions);

	const { effects, width, height } = options;

	const $canvas = document.createElement('canvas');
	$canvas.width = width;
	$canvas.height = height;

	const ctx = $canvas.getContext('2d', {
		willReadFrequently: true
	});

	const updateFrame = ($video: HTMLVideoElement) => {
		const { srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight } = getBox(
			$video,
			$canvas,
			options
		);

		if (effects.blur != null) {
			ctx.filter = `blur(${effects.blur}px)`;
		}

		ctx.drawImage($video, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);

		if (effects?.tint) {
			applyTint(ctx, effects.tint);
		}

		if (effects?.vignette) {
			applyVignette(ctx);
		}

		if (effects?.grain != null) {
			applyGrain(ctx, effects.grain);
		}

		// if (effects.haze) {
		//   applyHaze(ctx);
		// }
	};

	function setTintColor(tintColor: string) {
		effects.tint = tintColor;
	}

	return {
		$canvas,
		updateFrame,
		setTintColor
	};
}

function applyVignette(ctx: CanvasRenderingContext2D) {
	const { canvas } = ctx;
	const gradient = ctx.createRadialGradient(
		canvas.width / 2,
		canvas.height / 2,
		canvas.width / 4,
		canvas.width / 2,
		canvas.height / 2,
		canvas.width / 1.2
	);
	gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
	gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function applyGrain(ctx: CanvasRenderingContext2D, intensity: number = 0) {
	const { canvas } = ctx;
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;
	for (let i = 0; i < data.length; i += 4) {
		const rand = (Math.random() - 0.5) * intensity;
		data[i] += rand; // R
		data[i + 1] += rand; // G
		data[i + 2] += rand; // B
	}
	ctx.putImageData(imageData, 0, 0);
}

// function applyHaze(ctx) {
//   const {canvas} = ctx;
//   ctx.fillStyle = "rgba(200, 200, 200, 0.1)";
//   ctx.fillRect(0, 0, canvas.width, canvas.height);
// }

function applyTint(ctx: CanvasRenderingContext2D, tint: string) {
	const { canvas } = ctx;
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const tintRGB = hexToRgb(tint);

	const data = imageData.data;

	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];

		const gray = r * 0.299 + g * 0.587 + b * 0.114;

		data[i] = tintRGB.r * (gray / 255);
		data[i + 1] = (tintRGB.g * gray) / 255;
		data[i + 2] = (tintRGB.b * gray) / 255;
	}

	ctx.putImageData(imageData, 0, 0);
}

// type EdgesOptions = {
//   kernel?: 'prewitt' | 'laplacian' | 'sobel';
//   threshold?: number;
// };

// function applyEdges(imageData: ImageData, argOptions: EdgesOptions = {}) {
//   const options = defaults(argOptions, {
//     kernel: 'sobel',
//     // threshold: 15,
//   });
//
//   const { width, height, data } = imageData;
//
//   const srcData = data;
//
//   const gray = new Uint8ClampedArray(width * height);
//   for (let i = 0; i < width * height; i++) {
//     const r = srcData[i * 4];
//     const g = srcData[i * 4 + 1];
//     const b = srcData[i * 4 + 2];
//     gray[i] = 0.3 * r + 0.59 * g + 0.11 * b;
//   }
//
//   let gx, gy;
//   switch (options.kernel) {
//     case 'prewitt':
//       gx = [-1, 0, 1, -1, 0, 1, -1, 0, 1];
//       gy = [-1, -1, -1, 0, 0, 0, 1, 1, 1];
//       break;
//     case 'laplacian':
//       gx = [0, 1, 0, 1, -4, 1, 0, 1, 0];
//       gy = [0, 1, 0, 1, -4, 1, 0, 1, 0];
//       break;
//     case 'sobel':
//     default:
//       gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
//       gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
//   }
//
//   for (let y = 1; y < height - 1; y++) {
//     for (let x = 1; x < width - 1; x++) {
//       let px = 0,
//         py = 0;
//       for (let ky = -1; ky <= 1; ky++) {
//         for (let kx = -1; kx <= 1; kx++) {
//           const val = gray[(y + ky) * width + (x + kx)];
//           const k = (ky + 1) * 3 + (kx + 1);
//           px += gx[k] * val;
//           py += gy[k] * val;
//         }
//       }
//       let mag = Math.sqrt(px * px + py * py);
//       if (options.threshold != null) {
//         mag = mag > options.threshold ? mag : 0;
//       }
//       const i = (y * width + x) * 4;
//       data[i] = data[i + 1] = data[i + 2] = mag;
//       data[i + 3] = 255;
//     }
//   }
// }

function getBox(
	$video: HTMLVideoElement,
	$canvas: HTMLCanvasElement,
	argOptions = {}
): {
	srcX: number;
	srcY: number;
	srcWidth: number;
	srcHeight: number;
	dstX: number;
	dstY: number;
	dstWidth: number;
	dstHeight: number;
} {
	const options = defaults(argOptions, {
		offsetX: undefined,
		offsetY: undefined
	});

	const srcX = 0;
	const srcY = 0;
	const srcWidth = $video.videoWidth;
	const srcHeight = $video.videoHeight;

	const sourceToCanvasRatio =
		srcHeight > srcWidth ? srcWidth / $canvas.width : srcHeight / $canvas.height;

	const dstWidth = srcWidth / sourceToCanvasRatio;
	const dstHeight = srcHeight / sourceToCanvasRatio;

	let dstX = 0;
	if (options.offsetX === 'left') {
		// noop
	} else if (options.offsetX === 'right') {
		dstX = -(dstWidth - $canvas.width);
	} else if (options.offsetX === 'center') {
		dstX = -(dstWidth / 2 - $canvas.width / 2);
	} else if (typeof options.offsetX === 'number') {
		dstX = options.offsetX;
	}

	let dstY = 0;
	if (options.offsetY === 'top') {
		// noop
	} else if (options.offsetY === 'bottom') {
		dstY = -(dstHeight - $canvas.height);
	} else if (options.offsetY === 'center') {
		dstY = -(dstHeight / 2 - $canvas.height / 2);
	} else if (typeof options.offsetY === 'number') {
		dstY = options.offsetY;
	}

	return { srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight };
}
