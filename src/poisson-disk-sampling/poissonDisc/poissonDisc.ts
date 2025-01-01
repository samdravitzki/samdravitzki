import Bounds from "../../ecs/core/Bounds/Bounds";
import Vector from "../../ecs/core/Vector/Vector";
import randomInt from "../../lib/randomInt/randomInt";
import range from "../../lib/range/range";
import randomDots from "../randomDots/randomDots";

class Grid<T> {
  private grid: T[];
  private sizeX: number;
  private sizeY: number;

  constructor(sizeX: number, sizeY: number, defaultValue: T) {
    this.grid = range(sizeX * sizeY).map(() => defaultValue);

    this.sizeX = sizeX;
    this.sizeY = sizeY;
  }
}

/**
 * Generate a dot within a radius of a supplied dot
 */
function createRandomVectorNearby(
  point: Vector,
  radius: number,
  minRadius: number = 0
) {
  const randomAngle = 2 * Math.PI * Math.random();
  const randomRadius = (radius - minRadius) * Math.random() + minRadius;

  const x = point.x + randomRadius * Math.cos(randomAngle);
  const y = point.y + randomRadius * Math.sin(randomAngle);

  return Vector.create(x, y);
}

// Given an index of a flattened 2d array and the width of that 2d array return the index of the surrounding cells
export const indiciesSurroundingIndex = (
  index: number,
  width: number,
  height: number,
  radius: number = 1
): number[] => {
  const y = Math.floor(index / width);
  const x = index % width;

  const neighbours: number[] = [];

  for (let rowDiff = -radius; rowDiff <= radius; rowDiff += 1) {
    for (let colDiff = -radius; colDiff <= radius; colDiff += 1) {
      const neighbourX = x + rowDiff;
      const neighbourY = y + colDiff;

      // Only add neighbour if its in the grid bounds
      if (
        neighbourX >= 0 &&
        neighbourX < width &&
        neighbourY >= 0 &&
        neighbourY < height
      ) {
        const neighbour = neighbourX * width + neighbourY;
        neighbours.push(neighbour);
      }
    }
  }

  return neighbours;
};

/**
 * Generate a bunch of positions following poisson disc-sampling within a given bounds
 *
 * Implemented following the algorithm described in https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf
 * Also based alot on http://devmag.org.za/2009/05/03/poisson-disk-sampling/
 *
 * @param count the number of dots to generate
 * @param bounds the bounds to genereate the dots within
 */
function poissonDisc(bounds: Bounds): Vector[] {
  const minDistance = 30;
  const sampleLimit = 30;

  const cellSize = minDistance / Math.sqrt(2);

  const width = Math.ceil((bounds.max.x - bounds.min.x) / cellSize);
  const height = Math.ceil((bounds.max.y - bounds.min.y) / cellSize);

  const backgroundGrid = range(height * width).map(() => -1);

  // Convert a vector to an index in the background grid
  const vectorToGridIndex = (vector: Vector) => {
    const x = Math.floor(vector.x / cellSize);
    const y = Math.floor(vector.y / cellSize);

    return y * width + x;
  };

  // Check if given vector has any neighbours within distance r using the background grid
  const isNearbyOtherDots = (point: Vector): boolean => {
    const pointCellIndex = vectorToGridIndex(point);
    const cellsAroundPoint = indiciesSurroundingIndex(0, 1);

    return false;
  };

  const startingPoint = Vector.create(
    Math.random() * bounds.size[0],
    Math.random() * bounds.size[1]
  );

  const startingPointCellIndex = vectorToGridIndex(startingPoint);

  backgroundGrid[startingPointCellIndex] = 1;

  const active: Vector[] = [startingPoint];
  const output: Vector[] = [startingPoint];

  while (active.length > 0) {
    const randomActiveIndex = randomInt(active.length - 1);
    const activePoint = active[randomActiveIndex];

    const activeCountBefore = active.length;

    for (const i of range(sampleLimit)) {
      const newPoint = createRandomVectorNearby(
        activePoint,
        2 * minDistance,
        minDistance
      );

      if (bounds.inBounds(newPoint) && isNearbyOtherDots(newPoint)) {
        output.push(newPoint);
        active.push(newPoint);

        backgroundGrid[vectorToGridIndex(newPoint)] = 1;
      }
    }

    const activeCountAfter = active.length;

    // If no new points are added to the active list remove this as an active point
    if (activeCountBefore === activeCountAfter) {
      // remove item from active array after reading
      active.splice(randomActiveIndex, 1);
    }
  }

  return output;

  // return backgroundGrid.reduce((acc, value, i) => {
  //   if (value <= 0) {
  //     return acc;
  //   }

  //   const dot = Vector.create(
  //     (i % width) * cellSize + bounds.min.x,
  //     Math.floor(i / width) * cellSize + bounds.min.y
  //   );

  //   return [...acc, dot];
  // }, [] as Vector[]);
}

export default poissonDisc;
