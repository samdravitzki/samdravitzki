import Bounds from "../../../ecs/core/Bounds/Bounds";
import Vector from "../../../ecs/core/Vector/Vector";
import range from "../../../lib/range/range";
import { indiciesSurroundingIndex } from "../indiciesSurroundingIndex/indiciesSurroundingIndex";

/**
 * Creates a grid over a given bounds where each cell is of
 * the supplied size
 *
 * Contains all of the grid operations required for this implementation of poisson disc sampling
 */
export class BackgroundGrid {
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
