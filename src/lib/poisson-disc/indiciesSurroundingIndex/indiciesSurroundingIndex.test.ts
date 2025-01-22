import { expect, test } from "vitest";
import { indiciesSurroundingIndex } from "./indiciesSurroundingIndex";

// prettier-ignore
// reference grid
// const grid = [
//   0,  1,  2,  3,  4,  5,
//   6,  7,  8,  9,  10, 11,
//   12, 13, 14, 15, 16, 17,
//   18, 19, 20, 21, 22, 23,
//   24, 25, 26, 27, 28, 29,
//   30, 31, 32, 33, 34, 35,
// ]

test("should return grid surrounding supplied index", () => {
    const width = 6;
    const height = 6;

    const result = indiciesSurroundingIndex(14, width, height);

    // prettier-ignore
    expect(result).toEqual([
      7,  8,  9,
      13, 14, 15,
      19, 20, 21
    ]);
  });

test("should not include indexes when they fall outside width and/or height", () => {
  const width = 6;
  const height = 6;

  const result = indiciesSurroundingIndex(35, width, height);

  // prettier-ignore
  expect(result).toEqual([
      28, 29, 
      34, 35,
    ]);
});

test("should return larger grids with larger radiuses are supplied", () => {
  const width = 6;
  const height = 6;
  const radius = 2;

  const result = indiciesSurroundingIndex(21, width, height, radius);

  // prettier-ignore
  expect(result).toEqual([
      7,  8,  9,  10, 11, 
      13, 14, 15, 16, 17, 
      19, 20, 21, 22, 23, 
      25, 26, 27, 28, 29, 
      31, 32, 33, 34, 35,
    ]);
});
