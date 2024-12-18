import { expect, test } from "vitest";
import Bounds from "../../ecs/core/Bounds/Bounds";
import Vector from "../../ecs/core/Vector/Vector";
import randomDots from "./randomDots";

test("should return dot in random position within bounds", () => {
  const bounds = Bounds.create(Vector.create(1, 1), Vector.create(3, 3));

  const result = randomDots(1, bounds);

  const dot = result[0];
  expect(dot.x).greaterThanOrEqual(bounds.min.x);
  expect(dot.x).lessThanOrEqual(bounds.max.x);
  expect(dot.y).lessThanOrEqual(bounds.min.y);
  expect(dot.y).lessThanOrEqual(bounds.max.y);
});

test("should return number of dots equal to supplied count", () => {
  const count = 20;

  const result = randomDots(
    count,
    Bounds.create(Vector.create(1, 1), Vector.create(3, 3))
  );

  expect(result.length).toEqual(count);
});
