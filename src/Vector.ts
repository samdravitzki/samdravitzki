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
}