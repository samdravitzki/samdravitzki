import { expect, test } from "vitest";
import randomInt from "./randomInt";

test("should throw and error when supplied min is larger than max", () => {
  const min = 3;
  const max = 2;

  expect(() => randomInt(max, min)).toThrowError();
});

test("should return number between max and zero when only max is supplied", () => {
  const max = 10;

  const result = randomInt(max);

  expect(result).toBeGreaterThanOrEqual(0);
  expect(result).toBeLessThanOrEqual(max);
});

test("should return number between max and min when both min and max are supplied", () => {
  const min = 20;
  const max = 25;

  const result = randomInt(max, min);

  expect(result).toBeGreaterThanOrEqual(min);
  expect(result).toBeLessThanOrEqual(max);
});

test("should return number that is a multiple of 1 when interval is not supplied", () => {
  const max = 10;

  const result = randomInt(max);

  const isMultipleOfOne = result % 1 === 0;
  expect(isMultipleOfOne).toBe(true);
});

test("should return number that is a multiple of interval when interval is supplied", () => {
  const min = 0;
  const max = 25;
  const interval = 5;

  const result = randomInt(max, min, interval);

  const isMultipleOfOne = result % interval === 0;
  expect(isMultipleOfOne).toBe(true);
});
