import { expect, test } from "vitest";
import clamp from "./clamp";

test("should return value if value is between supplied min and max", () => {
  const value = 15;
  const min = 10;
  const max = 20;

  const result = clamp(value, max, min);

  expect(result).toEqual(value);
});

test("should return min if value is less than supplied min", () => {
  const value = 5;
  const min = 10;
  const max = 20;

  const result = clamp(value, max, min);

  expect(result).toEqual(min);
});

test("should return max if value is greater than supplied max", () => {
  const value = 25;
  const min = 10;
  const max = 20;

  const result = clamp(value, max, min);

  expect(result).toEqual(max);
});
