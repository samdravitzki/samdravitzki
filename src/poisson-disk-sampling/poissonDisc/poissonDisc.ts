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
 * Generate a bunch of positions following poisson disc-sampling within a given bounds
 *
 * @param count the number of dots to generate
 * @param bounds the bounds to genereate the dots within
 */
function poissonDisc(bounds: Bounds) {
  const minDistance = 30;
  const sampleLimit = 30;

  const cellSize = minDistance / Math.sqrt(2);

  const gridX = Math.ceil((bounds.max.x - bounds.min.x) / cellSize);
  const gridY = Math.ceil((bounds.max.y - bounds.min.y) / cellSize);

  const grid = range(gridY * gridX).map(() => -1);

  const startingIndex = randomInt(gridX * gridY - 1);

  grid[startingIndex] = 1;

  const activeList: number[] = [startingIndex];

  while (activeList.length > 0) {
    const randomActiveListIndex = randomInt(activeList.length);

    break;
  }

  return grid.reduce((acc, value, i) => {
    // if (value <= 0) {
    //   return acc;
    // }

    const dot = Vector.create(
      (i % gridX) * cellSize + bounds.min.x,
      Math.floor(i / gridX) * cellSize + bounds.min.y
    );

    return [...acc, dot];
  }, [] as Vector[]);
}

export default poissonDisc;
