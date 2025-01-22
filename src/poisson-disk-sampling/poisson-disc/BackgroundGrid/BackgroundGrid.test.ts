import { describe, expect, test } from "vitest";
import Bounds from "../../../ecs/core/Bounds/Bounds";
import Vector from "../../../ecs/core/Vector/Vector";
import { BackgroundGrid } from "./BackgroundGrid";

describe("constructor", () => {
  test("should construct BackgroundGrid with grid length to the number of cells in supplied bounds", () => {
    const width = 10;
    const height = 5;
    const cellSize = 0.1;
    const bounds = Bounds.create(
      Vector.create(0, 0),
      Vector.create(width, height)
    );

    const result = new BackgroundGrid(bounds, cellSize);

    expect(result.grid.length).toEqual(5000);
  });
});

const testBounds = Bounds.create(Vector.create(0, 0), Vector.create(51, 37));

describe("vectorToIndex", () => {
  const testBackgroundGrid = new BackgroundGrid(testBounds, 0.5);

  test("should return index of cell containing supplied vector", () => {
    const vectorInBounds = Vector.create(10, 5);

    const result = testBackgroundGrid.vectorToIndex(vectorInBounds);

    expect(result).toEqual(1040);
  });

  test("should throw error when supplied vector falls outside of grid bounds", () => {
    const vectorOutOfBounds = Vector.create(-1, 40);

    const throwsError = () =>
      testBackgroundGrid.vectorToIndex(vectorOutOfBounds);

    expect(throwsError).toThrowError();
  });
});

describe("addVector", () => {
  test("should add vector to grid at index of cell containing vector position", () => {
    const testBackgroundGrid = new BackgroundGrid(testBounds, 0.5); // Need a fresh grid because this test mutates it
    const vector = Vector.create(10, 5);

    testBackgroundGrid.addVector(vector);

    expect(testBackgroundGrid.grid[1040]).toEqual(vector);
  });

  test("should throw error when supplied vector falls outside of grid bounds", () => {
    const testBackgroundGrid = new BackgroundGrid(testBounds, 0.5);
    const vectorOutOfBounds = Vector.create(-1, 40);

    const throwsError = () => testBackgroundGrid.addVector(vectorOutOfBounds);

    expect(throwsError).toThrowError();
  });
});

describe("vectorHasVectorsNearby", () => {
  const testBackgroundGrid = new BackgroundGrid(testBounds, 1);
  const testPoint = Vector.create(15, 13);
  testBackgroundGrid.addVector(Vector.create(15, 15));
  testBackgroundGrid.addVector(Vector.create(17, 13));
  testBackgroundGrid.addVector(Vector.create(15, 11));
  testBackgroundGrid.addVector(Vector.create(13, 13));

  test("should return true when point has other points within the given distance", () => {
    const distance = 3;

    const result = testBackgroundGrid.vectorHasVectorsNearby(
      testPoint,
      distance
    );

    expect(result).toBe(true);
  });

  test("should return false when point has no other points within the given distance", () => {
    const distance = 2;

    const result = testBackgroundGrid.vectorHasVectorsNearby(
      testPoint,
      distance
    );

    expect(result).toBe(false);
  });
});
