/**
 * Describes a point in two-dimentional space
 */
export default class Position {
    x: number;
    y: number;

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
}