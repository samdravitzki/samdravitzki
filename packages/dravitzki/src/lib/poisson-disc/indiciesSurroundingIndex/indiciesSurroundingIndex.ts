/**
 * Given an index of a flattened 2d array and the width
 * of that 2d array return the index of the surrounding cells
 */

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
