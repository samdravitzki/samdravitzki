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

function createSnake(length: number, start: Position) {
  return range(length).map((i) => new SnakeChunk(Position.create(start.x + i * 10, start.y )))
}

new p5(sketch => {
  const p = sketch as unknown as p5;

  const playBounds = Bounds.create(Position.create(0, 0), Position.create(500, 500));
  
  const snakeChunkSize = 10;
  let snake = createSnake(20, playBounds.randomPosition(snakeChunkSize));
  let slitheringDirection: Direction = 'south';

  let snackPosition = playBounds.randomPosition(snakeChunkSize);


  p.setup = function setup() {
    p.createCanvas(...playBounds.size);

    setInterval(onSlitherInterval, 100);
  };

  p.draw = function draw() {
    p.background(0);
    p.fill(205);

    for (const chunk of snake) {
      p.rect(chunk.position.x, chunk.position.y, 10, 10);
    }

    p.fill(100, 200, 100);
    p.rect(snackPosition.x, snackPosition.y, 10, 10);
  };

  function onSlitherInterval() {
    const stepSize = 10;

    const [head] = snake;

    // Calculate the next position of the snake head
    let nextHeadPosition: Position = Position.create(head.position.x, head.position.y);

    switch (slitheringDirection) {
      case 'north':
        nextHeadPosition.y = nextHeadPosition.y - stepSize;
        break;
      case 'east':
        nextHeadPosition.x = nextHeadPosition.x + stepSize;
        break;
      case 'south':
        nextHeadPosition.y = nextHeadPosition.y + stepSize;
        break;
      case 'west':
        nextHeadPosition.x = nextHeadPosition.x - stepSize;
        break;
    }

    nextHeadPosition = playBounds.boundedMod(nextHeadPosition);

    // If the snake is going to collide with itself
    if (snake.filter((chunk) => chunk.position.x === nextHeadPosition.x && chunk.position.y === nextHeadPosition.y).length > 0) {
      // Reset the game
      snake = createSnake(20, playBounds.randomPosition(snakeChunkSize));
      return;
    }


    const newHead = new SnakeChunk(nextHeadPosition);

    // The approach to snake movement was based on https://github.com/taniarascia/snek/blob/master/src/Game.js
    snake.unshift(newHead);

    // If the snack can be eaten
    if (newHead.position.equals(snackPosition)) {
      snackPosition = playBounds.randomPosition(snakeChunkSize);
    } else {
      snake.pop();
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
