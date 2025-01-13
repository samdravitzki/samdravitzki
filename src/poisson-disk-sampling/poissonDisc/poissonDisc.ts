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
      const neighbourX = x + colDiff;
      const neighbourY = y + rowDiff;

      // Only add neighbour if its in the grid bounds
      if (
        neighbourX >= 0 &&
        neighbourX < width &&
        neighbourY >= 0 &&
        neighbourY < height
      ) {
        const neighbour = neighbourY * width + neighbourX;
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

  const backgroundGrid: (Vector | null)[] = range(height * width).map(
    () => null
  );

  // Convert a vector to an index in the background grid
  const vectorToGridIndex = (vector: Vector) => {
    const x = Math.floor(vector.x / cellSize);
    const y = Math.floor(vector.y / cellSize);

    return y * width + x;
  };
  /**
   * Check if given vector has any neighbours within distance r using the background grid
   *
   * If there is a point within the distance of supplied point return true
   *
   * @param point to compare
   * @param minDistance size of the neighbourhood
   * @returns true if there is a point in neighbourhood of given point
   */
  const inNeighbourhoodOfAnotherDot = (
    point: Vector,
    minDistance: number
  ): boolean => {
    const pointCellIndex = vectorToGridIndex(point);
    const cellsAroundPoint = indiciesSurroundingIndex(
      pointCellIndex,
      width,
      height,
      2
    );

    for (const cellIndex of cellsAroundPoint) {
      const neighbouringCell = backgroundGrid[cellIndex];

      if (neighbouringCell !== null) {
        const neighbourDistance = neighbouringCell.distance(point);

        if (neighbourDistance <= minDistance) {
          return true;
        }
      }
    }

    return false;
  };

  const startingPoint = Vector.create(
    Math.random() * bounds.size[0],
    Math.random() * bounds.size[1]
  );

  const startingPointCellIndex = vectorToGridIndex(startingPoint);

  backgroundGrid[startingPointCellIndex] = startingPoint;

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
        !inNeighbourhoodOfAnotherDot(newPoint, minDistance)
      ) {
        output.push(newPoint);
        active.push(newPoint);
        console.log(
          `${newPoint} replacing ${backgroundGrid[vectorToGridIndex(newPoint)]}`
        );
        backgroundGrid[vectorToGridIndex(newPoint)] = newPoint;
      }
    }
  }

  return output;
}

export default poissonDisc;
