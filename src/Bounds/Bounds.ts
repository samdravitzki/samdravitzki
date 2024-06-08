import Vector from '../Vector/Vector';
import boundedMod from '../lib/boundedMod/boundedMod';
import randomInt from '../lib/randomInt/randomInt';

/**
 * Describes a square boudary in two-dimentional space
 * 
 * Where min is the top-left most point and max is the bottom-right 
 * most point of the square
 */
export default class Bounds {
  readonly min: Vector;
  readonly max: Vector;

  constructor(min: Vector, max: Vector) {
    this.min = min;
    this.max = max;
  }

  static create(min: Vector, max: Vector) {
    return new Bounds(min, max);
  }

  /**
   * The size of the bounds
   * @returns tuple of two numbers where the first is the  length of the x axis the second is the length of the y axis
   */
  get size(): [number, number] {
    return [this.max.x - this.min.x, this.max.y - this.min.y];
  }

  /**
   * Generates a random position in the bounds
   * @param increment only generate a random position that is a multiple of the supplied increment
   * @returns 
   */
  randomPosition(increment: number = 1): Vector {
    const randomXPosition = randomInt(this.max.x, this.min.x, increment);
    const randomYPosition = randomInt(this.max.y, this.min.y, increment);

    return Vector.create(randomXPosition, randomYPosition);
  }

  /**
   * Transform given position to bounded mod within these bounds
   * @param position 
   * @returns position within bounds
   */
  boundedMod(position: Vector): Vector {
    return Vector.create(
      boundedMod(position.x, this.max.x, this.min.x),
      boundedMod(position.y, this.max.y, this.min.y)
    )
  }
}