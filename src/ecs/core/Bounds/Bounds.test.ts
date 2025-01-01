import { describe, expect, test } from "vitest";
import Vector from "../Vector/Vector";
import Bounds from "./Bounds";

describe("factory method", () => {
  test("should create an instance of bounds with supplied min and max vectors", () => {
    const v1 = Vector.create(1, 1);
    const v2 = Vector.create(2, 4);

    const result = Bounds.create(v1, v2);

    expect(v1.x).toEqual(result.min.x);
    expect(v1.y).toEqual(result.min.y);
    expect(v2.x).toEqual(result.max.x);
    expect(v2.y).toEqual(result.max.y);
  });
});

describe("center property", () => {
  test("should return the vector at the center of both supplied vectors", () => {
    const v1 = Vector.create(1, 1);
    const v2 = Vector.create(2, 4);

    const result = Bounds.create(v1, v2);

    expect(result.center.x).toEqual(1.5);
    expect(result.center.y).toEqual(2.5);
  });
});

describe("size method", () => {
  test("should tuple containing size of each bound vector", () => {
    const v1 = Vector.create(1, 1);
    const v2 = Vector.create(2, 4);
    const bounds = Bounds.create(v1, v2);

    const [sizeX, sizeY] = bounds.size;

    expect(sizeX).toEqual(1);
    expect(sizeY).toEqual(3);
  });
});

describe("randomPosition method", () => {
  test("should return random position in the bounds", () => {
    const v1 = Vector.create(1, 1);
    const v2 = Vector.create(2, 4);
    const bounds = Bounds.create(v1, v2);

    const result = bounds.randomPosition();

    expect(result.x).greaterThanOrEqual(v1.x);
    expect(result.x).lessThan(v2.x);
    expect(result.y).greaterThanOrEqual(v1.y);
    expect(result.y).lessThan(v2.y);
  });
});

describe("boundedMod method", () => {
  test("should return position in bounds equal to its mod of each axis", () => {
    const v1 = Vector.create(4, 8);
    const v2 = Vector.create(5, 7);
    const bounds = Bounds.create(v1, v2);
    const modBounds = Vector.create(3, 3);

    const result = bounds.boundedMod(modBounds);

    expect(result.x).toEqual(4);
    expect(result.y).toEqual(8);
  });
});

describe("inBounds method", () => {
  test("should return true if supplied vector is inside the bounds", () => {
    const vector = Vector.create(4, 5);
    const bounds = Bounds.create(Vector.create(2, 3), Vector.create(6, 7));

    const result = bounds.inBounds(vector);

    expect(result).toEqual(true);
  });

  test("should return false if supplied vector is outside the bounds", () => {
    const vector = Vector.create(1, 1);
    const bounds = Bounds.create(Vector.create(4, 8), Vector.create(5, 7));

    const result = bounds.inBounds(vector);

    expect(result).toEqual(false);
  });

  test("should return true if supplied vector at max bounds", () => {
    const vector = Vector.create(6, 7);
    const bounds = Bounds.create(Vector.create(2, 3), Vector.create(6, 7));

    const result = bounds.inBounds(vector);

    expect(result).toEqual(true);
  });

  test("should return true if supplied vector at min bounds", () => {
    const vector = Vector.create(2, 3);
    const bounds = Bounds.create(Vector.create(2, 3), Vector.create(6, 7));

    const result = bounds.inBounds(vector);

    expect(result).toEqual(true);
  });
});
