import p5 from 'p5';
import Direction from '../Direction';
import Snake from './Snake';
import Bounds from '../Bounds';
import Vector from '../Vector/Vector';

document.getElementById('snake-game')!.innerHTML = `
    <button id="exit-snake-button">❌</button>
    <div id="sketch"></div>
`;

document.getElementById('exit-snake-button')?.addEventListener('click', () => {
  const snakeGame = document.getElementById('snake-game')!;
  const mainContent = document.getElementById('main-content')!;

  if (snakeGame.style.display === 'block') {
    snakeGame.style.display = 'none';
    mainContent.style.display = 'block';
  } else {
    snakeGame.style.display = 'block';
    mainContent.style.display = 'none';
  }
});



function generateSnackPosition(bounds: Bounds) {
    return bounds.randomPosition(10)
        .minus(Vector.create(10, 10))
} 

new p5(sketch => {
    const p = sketch as unknown as p5;

    const playBounds = Bounds.create(Vector.create(0, 0), Vector.create(500, 500));
    const snakeChunkSize = 10;

    const snakeStartingSize = 3;
    let snake = Snake.create(snakeStartingSize, Vector.create(120, 120), snakeChunkSize);
    let slitheringDirection = new Direction('south');

    let snackPosition = generateSnackPosition(playBounds); // To not generate 500, 500 snack position which is out of bounds

    let score = 0;

    p.setup = function setup() {
        p.createCanvas(...playBounds.size);
        p.colorMode(p.HSB, 360, 100, 100, 100);
        p.noStroke();

        // move snake every second
        setInterval(onSlitherInterval, 100);
    };

    p.draw = function draw() {
        const gradient = p.drawingContext.createLinearGradient(
            playBounds.min.x, playBounds.min.y,
            playBounds.max.x, playBounds.max.y
        );

        gradient.addColorStop(0, p.color(310, 100, 100, 100));
        gradient.addColorStop(1, p.color(250, 100, 100, 100));

        p.drawingContext.fillStyle = gradient;

        p.background(0);
        p.rect(playBounds.min.x, playBounds.min.y, playBounds.max.x, playBounds.max.y);

        p.fill(205);

        for (const chunk of snake.chunks) {
            p.rect(chunk.position.x, chunk.position.y, 10, 10);
        }

        p.fill(100, 200, 100);
        p.rect(snackPosition.x, snackPosition.y, 10, 10);

        p.fill(255);
        p.textSize(32);
        p.text(score, 15, 35);
    };

    function reset() {
        snackPosition = generateSnackPosition(playBounds);
        snake = Snake.create(snakeStartingSize, playBounds.randomPosition(snakeChunkSize), snakeChunkSize);
        slitheringDirection = new Direction('south');
        score = 0;
    }

    function onSlitherInterval() {
        if (snackPosition.equals(snake.position)) {
            snake.grow(slitheringDirection, playBounds);
            snackPosition = generateSnackPosition(playBounds); // To not generate 500, 500 snack position which is out of bounds
            score += 1;
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
                if (slitheringDirection.value !== 'south') {
                    slitheringDirection = new Direction('north');
                }
                break;
            case 'd':
                if (slitheringDirection.value !== 'west') {
                    slitheringDirection = new Direction('east');
                }
                break;
            case 's':
                if (slitheringDirection.value !== 'north') {
                    slitheringDirection = new Direction('south');
                }
                break;
            case 'a':
                if (slitheringDirection.value !== 'east') {
                    slitheringDirection = new Direction('west');
                }
                break;
        }
    }
  
}, document.getElementById('sketch')!);