import Bounds from './Bounds';
import Vector from './Vector/Vector';
import range from './lib/range/range';

class SnakeChunk {
    position: Vector;

    constructor(position: Vector) {
        this.position = position;
    }
}

export default class Snake {
    private _chunks: SnakeChunk[]
    readonly chunkSize: number;

    get chunks(): SnakeChunk[] {
        return this._chunks;
    }

    /**
     * The position of the snake at the head
     */
    get position(): Vector {
        return this._chunks[0].position;
    }

    constructor(chunks: SnakeChunk[], chunkSize: number) {
        this._chunks = chunks;
        this.chunkSize = chunkSize;
    }

    static create(length: number, start: Vector, chunkSize: number) {
        const chunks = range(length)
            .map((i) => new SnakeChunk(Vector.create(start.x + i * chunkSize, start.y )))

        return new Snake(chunks, chunkSize);
    }

    private getPositionChangeFromDirection(direction: Direction) {
        switch (direction) {
            case 'north':
                return new Vector(0, -1);
            case 'east':
                return new Vector(1, 0);
            case 'south':
                return new Vector(0, 1);
            case 'west':
                return new Vector(-1, 0);
    }
    }

    isSelfColliding(): boolean {
        const [head, ...otherChunks] = this._chunks;
        return otherChunks.filter((chunk) => chunk.position.equals(head.position)).length > 0;
    }

    move(direction: Direction, bounds: Bounds) {
        this.grow(direction, bounds);
        this._chunks.pop();
    }

    /**
     * Add a new chunk to the snake in any direction
     * @param direction 
     * @param bounds 
     * @param chunkSize 
     */
    grow(direction: Direction, bounds: Bounds) {
        const changeInPosition = this.getPositionChangeFromDirection(direction);

        const [head] = this.chunks;

        const nextHeadPosition = head.position.plus(changeInPosition.times(this.chunkSize));
        const nextHeadPositionInBounds = bounds.boundedMod(nextHeadPosition);

        const newHead = new SnakeChunk(nextHeadPositionInBounds);

        this._chunks.unshift(newHead);
    }
}