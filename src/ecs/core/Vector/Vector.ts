/**
 * Describes a point in two-dimentional space
 */
export default class Vector {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static create(x: number, y: number) {
    return new Vector(x, y);
  }

  equals(other: Vector): boolean {
    return this.x === other.x && this.y === other.y;
  }

  plus(other: Vector): Vector {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  minus(other: Vector): Vector {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  times(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  /**
   * Return the distance between two points
   * @param other
   * @returns a scalar value
   */
  distance(other: Vector): number {
    const distanceX = this.x - other.x;
    const distanceY = this.y - other.y;

    // Just a little bit of the Pythagorean theorem
    return Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
  }

  length(): number {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  normalised(): Vector {
    return new Vector(this.x / this.length(), this.y / this.length());
  }

  /**
   * Return the dot product of this vector and the supplied vector
   * @param other
   * @returns the dot product
   */
  dot(other: Vector): number {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * Return a new vector of this vector reflected around
   * a supplied normal vector
   *
   * From https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector
   * I do not understand how this maths works
   *
   * This looks worth reading to learn more https://chicio.medium.com/how-to-calculate-the-reflection-vector-7f8cab12dc42
   */
  reflect(normal: Vector): Vector {
    return this.minus(normal.times(this.dot(normal) * 2));
  }
}
