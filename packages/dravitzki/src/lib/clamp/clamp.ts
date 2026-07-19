export default function clamp(value: number, max: number, min: number = 0) {
  return Math.min(Math.max(value, min), max);
}
