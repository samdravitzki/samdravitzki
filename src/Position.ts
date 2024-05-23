/**
 * Describes a point in two-dimentional space
 */
export default class Position {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static create(x: number, y: number) {
        return new Position(x, y);
    }

    equals(other: Position): boolean {
        return this.x === other.x && this.y === other.y;
    }

    plus(other: Position): Position {
        return new Position(this.x + other.x, this.y + other.y);
    }

    minus(other: Position): Position {
        return new Position(this.x - other.x, this.y - other.y);
    }

    times(scalar: number): Position {
        return new Position(this.x * scalar, this.y * scalar);
    }
}