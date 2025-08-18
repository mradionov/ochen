export function hexToRgb(hex) {
	hex = hex.replace(/^#/, '');

	const bigint = parseInt(hex, 16);

	return {
		r: (bigint >> 16) & 255,
		g: (bigint >> 8) & 255,
		b: bigint & 255
	};
}
