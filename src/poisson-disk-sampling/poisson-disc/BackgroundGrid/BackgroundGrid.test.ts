import { expect, test } from "vitest";
import Bounds from "../../../ecs/core/Bounds/Bounds";
import Vector from "../../../ecs/core/Vector/Vector";
import { BackgroundGrid } from "./BackgroundGrid";

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
