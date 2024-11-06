/**
 * Generate a random integer between a minimum and maximum inclusive
 *
 * Based on https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
 *
 * @param max the maximum integer that can be generated
 * @param min the minimum integer that can be generated
 * @param interval only random numbers will be generated that are multiples of of the interval
 * @returns
 */
export default function randomInt(
  max: number,
  min: number = 0,
  interval: number = 1,
): number {
  if (min > max) {
    throw new Error("min cannot be larger than max");
  }

  return (
    Math.ceil(Math.floor(Math.random() * (max - min) + min) / interval) *
    interval
  );
}
