import { expect, test } from "vitest";
import range from "../../range/range";
import Vector from "../../../ecs/core/Vector/Vector";
import createRandomVectorNearby from "./createRandomVectorNearby";

// This tests many points to account for randomness
test("should generate random points only within annulus from given point", () => {
  const originPoint = Vector.create(3, 3);
  const minRadius = 2;
  const maxRadius = 4;

  const points = range(100).map(() => {
    return createRandomVectorNearby(originPoint, maxRadius, minRadius);
  });

  points.forEach((point) => {
    const distance = point.distance(originPoint);
    expect(distance).greaterThan(minRadius);
    expect(distance).lessThan(maxRadius);
  });
});
