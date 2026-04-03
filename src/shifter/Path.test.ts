import { describe, expect, test } from "vitest";
import Path from "./Path";
import Vector from "../ecs/core/Vector/Vector";

describe("edges getter", () => {
  test("returns the edges of the path", () => {
    const path = new Path([
      Vector.create(0, 0),
      Vector.create(1, 0),
      Vector.create(1, 1),
    ]);

    const edges = path.edges();

    expect(edges).toEqual([
      { start: Vector.create(0, 0), end: Vector.create(1, 0) },
      { start: Vector.create(1, 0), end: Vector.create(1, 1) },
    ]);
  });
});
