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
        return Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2))
    }

    length(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    normalised(): Vector {
        return new Vector(this.x / this.length(), this.y / this.length());
    }
}