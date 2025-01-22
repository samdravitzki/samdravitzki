import { expect, test } from "vitest";
import Bounds from "../../ecs/core/Bounds/Bounds";
import Vector from "../../ecs/core/Vector/Vector";
import poissonDisc from "./poisson-disc";
const bounds = Bounds.create(Vector.create(0, 0), Vector.create(3, 3));

test("should return dot in random position within bounds", () => {
  const result = poissonDisc(bounds);

  const dot = result[0];
  expect(dot.x).greaterThanOrEqual(bounds.min.x);
  expect(dot.x).lessThanOrEqual(bounds.max.x);
  expect(dot.y).greaterThanOrEqual(bounds.min.y);
  expect(dot.y).lessThanOrEqual(bounds.max.y);
});

test("should not generate a vector within the minDistance of another point", () => {
  const minDistance = 1;

  const result = poissonDisc(bounds, minDistance);

  result.forEach((v1) => {
    result.forEach((v2) => {
      if (v1 === v2) {
        return;
      }

      expect(v1.distance(v2)).toBeGreaterThanOrEqual(minDistance);
    });
  });

});
