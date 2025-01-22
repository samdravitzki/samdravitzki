import { expect, test } from "vitest";
import boundedMod from "./bounded-mod";

test("should not modify x when x falls between max and min", () => {
  const min = 10;
  const max = 20;
  const x = 25;

  const result = boundedMod(x, max, min);

  expect(result).toEqual(15);
});

test("should modify x to fall between max and min when x is greater than max", () => {
  const min = 10;
  const max = 20;
  const x = 25;

  const result = boundedMod(x, max, min);

  expect(result).toEqual(15);
});

test("should modify x to fall between max and min when x is less than min", () => {
  const min = 10;
  const max = 20;
  const x = 3;

  const result = boundedMod(x, max, min);

  expect(result).toEqual(13);
});

test("should modify x to fall between max and 0 when x is greater than max and min is not supplied", () => {
  const max = 20;
  const x = 23;

  const result = boundedMod(x, max);

  expect(result).toEqual(3);
});
