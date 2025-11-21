export function toMinutesString(timeSec: number, showSeconds = false) {
  const min = Math.floor(timeSec / 60);
  const secRest = Math.floor(timeSec % 60);
  let str = `${min}m ${secRest}s`;
  if (showSeconds) {
    str += ` (${Math.floor(timeSec)}s)`;
  }
  return str;
}

export function toClockString(timeSec: number) {
  const min = Math.floor(timeSec / 60);
  const secRest = Math.floor(timeSec % 60);
  const minStr = min.toString().padStart(2, '0');
  const secStr = secRest.toString().padStart(2, '0');
  return `${minStr}:${secStr}`;
}
