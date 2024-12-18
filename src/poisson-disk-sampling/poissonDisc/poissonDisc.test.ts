import { expect, test } from "vitest";
import Bounds from "../../ecs/core/Bounds/Bounds";
import Vector from "../../ecs/core/Vector/Vector";
import poissonDisc from "./poissonDisc";

test("should return dot in random position within bounds", () => {
  const bounds = Bounds.create(Vector.create(1, 1), Vector.create(3, 3));

  const result = poissonDisc(bounds);

  const dot = result[0];
  expect(dot.x).greaterThanOrEqual(bounds.min.x);
  expect(dot.x).lessThanOrEqual(bounds.max.x);
  expect(dot.y).lessThanOrEqual(bounds.min.y);
  expect(dot.y).lessThanOrEqual(bounds.max.y);
});
