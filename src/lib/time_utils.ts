export function toMinutesString(timeSec: number) {
	const min = Math.floor(timeSec / 60);
	const secRest = Math.floor(timeSec % 60);
	return `${min}m ${secRest}s`;
}

export function toClockString(timeSec: number) {
	const min = Math.floor(timeSec / 60);
	const secRest = Math.floor(timeSec % 60);
	const minStr = min.toString().padStart(2, '0');
	const secStr = secRest.toString().padStart(2, '0');
	return `${minStr}:${secStr}`;
}
