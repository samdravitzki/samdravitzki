import { m } from "vitest/dist/reporters-yx5ZTtEV.js";
import Bounds from "../../ecs/core/Bounds/Bounds";
import Vector from "../../ecs/core/Vector/Vector";
import randomInt from "../randomInt/randomInt";
import range from "../range/range";
import createRandomVectorNearby from "./createRandomVectorNearby/createRandomVectorNearby";
import { BackgroundGrid } from "./BackgroundGrid/BackgroundGrid";

/**
 * Generate a bunch of positions following poisson disc-sampling within a given bounds
 *
 * The result is a more structured random distribution of vectors than purely random points generated within
 * a given bounds
 *
 * Implemented following the algorithm described in https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf
 * Also based alot on http://devmag.org.za/2009/05/03/poisson-disk-sampling/
 *
 * @param bounds the bounds to genereate the dots within
 */
function poissonDisc(
  bounds: Bounds,
  minDistance: number = 30,
  sampleLimit: number = 30
): Vector[] {
  const cellSize = minDistance / Math.sqrt(2);

  const backgroundGrid = new BackgroundGrid(bounds, cellSize);

  const startingPoint = Vector.create(
    Math.random() * bounds.size[0],
    Math.random() * bounds.size[1]
  );

  backgroundGrid.addVector(startingPoint);

  const active: Vector[] = [startingPoint];
  const output: Vector[] = [startingPoint];

  while (active.length > 0) {
    const randomActiveIndex = randomInt(active.length - 1);
    const activePoint = active[randomActiveIndex];
    active.splice(randomActiveIndex, 1);

    const samples = range(sampleLimit);

    for (const _sample of samples) {
      const newPoint = createRandomVectorNearby(
        activePoint,
        2 * minDistance,
        minDistance
      );

      if (
        bounds.inBounds(newPoint) &&
        !backgroundGrid.vectorHasVectorsNearby(newPoint, minDistance)
      ) {
        output.push(newPoint);
        active.push(newPoint);
        backgroundGrid.addVector(newPoint);
      }
    }
  }

  return output;
}

export default poissonDisc;
