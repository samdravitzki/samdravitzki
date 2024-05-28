import p5 from 'p5';
import './style.css'
import range from './lib/range/range';
import Position from './Position';
import Bounds from './Bounds';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>dravitzki.com</h1>
    <div id="sketch"></div>
  </div>
`

type Direction = 'north' | 'east' | 'south' | 'west';


class SnakeChunk {
  position: Position;

  constructor(position: Position) {
    this.position = position;
  }
}

class Snake {
  private _chunks: SnakeChunk[]
  readonly chunkSize: number;

  get chunks(): SnakeChunk[] {
    return this._chunks;
  }

  /**
   * The position of the snake at the head
   */
  get position(): Position {
    return this._chunks[0].position;
  }

  constructor(chunks: SnakeChunk[], chunkSize: number) {
    this._chunks = chunks;
    this.chunkSize = chunkSize;
  }

  static create(length: number, start: Position, chunkSize: number) {
    const chunks = range(length)
      .map((i) => new SnakeChunk(Position.create(start.x + i * chunkSize, start.y )))

    return new Snake(chunks, chunkSize);
  }

  private getPositionChangeFromDirection(direction: Direction) {
    switch (direction) {
      case 'north':
        return new Position(0, -1);
      case 'east':
        return new Position(1, 0);
      case 'south':
        return new Position(0, 1);
      case 'west':
        return new Position(-1, 0);
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

function generateSnackPosition(bounds: Bounds) {
  return bounds.randomPosition(10)
  .minus(Position.create(10, 10))
}

new p5(sketch => {
  const p = sketch as unknown as p5;

  const playBounds = Bounds.create(Position.create(0, 0), Position.create(500, 500));
  const snakeChunkSize = 10;

  let snake = Snake.create(25, Position.create(120, 120), snakeChunkSize);
  let slitheringDirection: Direction = 'south';

  let snackPosition = generateSnackPosition(playBounds); // To not generate 500, 500 snack position which is out of bounds


  p.setup = function setup() {
    p.createCanvas(...playBounds.size);

    setInterval(onSlitherInterval, 100);
  };

  p.draw = function draw() {
    p.background(0);
    p.fill(205);

    for (const chunk of snake.chunks) {
      p.rect(chunk.position.x, chunk.position.y, 10, 10);
    }

    p.fill(100, 200, 100);
    p.rect(snackPosition.x, snackPosition.y, 10, 10);
  };

  function reset() {
    snackPosition = generateSnackPosition(playBounds);
    snake = Snake.create(20, playBounds.randomPosition(snakeChunkSize), snakeChunkSize);
    slitheringDirection = 'south'
  }

  function onSlitherInterval() {

    if (snackPosition.equals(snake.position)) {
      snake.grow(slitheringDirection, playBounds);
      snackPosition = generateSnackPosition(playBounds); // To not generate 500, 500 snack position which is out of bounds
    } else {
      snake.move(slitheringDirection, playBounds);
    }

    if (snake.isSelfColliding()) {
      // reset
      reset();
    }
  }

  p.keyPressed = function keyPressed() {
    switch (p.key) {
      case 'w':
        // Only allow a change in direction if its not the oppisite of the current direction
        if (slitheringDirection !== 'south') {
          slitheringDirection = 'north';
        }
        break;
      case 'd':
        if (slitheringDirection !== 'west') {
          slitheringDirection = 'east';
        }
        break;
      case 's':
        if (slitheringDirection !== 'north') {
          slitheringDirection = 'south';
        }
        break;
      case 'a':
        if (slitheringDirection !== 'east') {
          slitheringDirection = 'west';
        }
        break;
    }
  }

}, document.getElementById('sketch')!)
