import { m } from "vitest/dist/reporters-yx5ZTtEV.js";
import Bounds from "../../ecs/core/Bounds/Bounds";
import Vector from "../../ecs/core/Vector/Vector";
import randomInt from "../../lib/randomInt/randomInt";
import range from "../../lib/range/range";
import createRandomVectorNearby from "./createRandomVectorNearby/createRandomVectorNearby";

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
 * Creates a grid over a given bounds where each cell is of
 * the supplied size
 *
 * Contains all of the grid operations required for this implementation of poisson disc sampling
 */
class BackgroundGrid {
  private bounds: Bounds;
  private cellSize: number;
  // Width of grid in number of cells
  private gridWidth: number;
  // Height of grid in number of cells
  private gridHeight: number;
  grid: (Vector | null)[];

  constructor(bounds: Bounds, cellSize: number) {
    this.bounds = bounds;
    this.cellSize = cellSize;

    this.gridWidth = Math.ceil((bounds.max.x - bounds.min.x) / cellSize);
    this.gridHeight = Math.ceil((bounds.max.y - bounds.min.y) / cellSize);

    this.grid = range(this.gridWidth * this.gridHeight).map(() => null);
  }

  /**
   * Calculate the index of the cell in the grid that
   * contains the position of the supplied vector
   * @param vector a vector in the bounds
   */
  vectorToIndex(vector: Vector): number {
    const x = Math.floor(vector.x / this.cellSize);
    const y = Math.floor(vector.y / this.cellSize);

    return y * this.gridWidth + x;
  }

  addPoint(point: Vector) {
    const pointCellIndex = this.vectorToIndex(point);
    this.grid[pointCellIndex] = point;
  }

  indiciesSurroundingIndex(index: number, radius: number) {
    return indiciesSurroundingIndex(
      index,
      this.gridWidth,
      this.gridHeight,
      radius
    );
  }

  /**
   * Check if given vector has any neighbours within distance r using the background grid to
   * reduce the number of points to search over
   *
   * If there is a point within the distance of supplied point return true
   *
   * @param point to compare
   * @param distance the distance at which a point is considered nearby
   * @returns true if there is a point in neighbourhood of given point
   */
  pointHasPointsNearby(point: Vector, distance: number): boolean {
    const pointCellIndex = this.vectorToIndex(point);
    const cellsAroundPoint = this.indiciesSurroundingIndex(pointCellIndex, 2);

    for (const cellIndex of cellsAroundPoint) {
      const neighbouringCell = this.grid[cellIndex];

      if (neighbouringCell !== null) {
        const neighbourDistance = neighbouringCell.distance(point);

        if (neighbourDistance < distance) {
          return true;
        }
      }
    }

    return false;
  }
}

/**
 * Generate a bunch of positions following poisson disc-sampling within a given bounds
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

  backgroundGrid.addPoint(startingPoint);

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
        !backgroundGrid.pointHasPointsNearby(newPoint, minDistance)
      ) {
        output.push(newPoint);
        active.push(newPoint);
        backgroundGrid.addPoint(newPoint);
      }
    }
  }

  return output;
}

export default poissonDisc;
