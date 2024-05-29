import p5 from 'p5';
import './style.css'
import Vector from './Vector/Vector';
import Bounds from './Bounds';
import Snake from './Snake';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>dravitzki.com</h1>
    <div id="sketch"></div>
  </div>
`

function generateSnackPosition(bounds: Bounds) {
  return bounds.randomPosition(10)
    .minus(Vector.create(10, 10))
}

new p5(sketch => {
  const p = sketch as unknown as p5;

  const playBounds = Bounds.create(Vector.create(0, 0), Vector.create(500, 500));
  const snakeChunkSize = 10;

  let snake = Snake.create(25, Vector.create(120, 120), snakeChunkSize);
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
