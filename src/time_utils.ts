export function toMinutesString(duration: number) {
  const min = Math.floor(duration / 60);
  const secRest = Math.floor(duration % 60);
  return `${min}m ${secRest}s`;
}
