import p5 from 'p5';
import Bounds from '../Bounds/Bounds';
import Vector from '../Vector/Vector';


document.getElementById('pong-game')!.innerHTML = `
    <button id="exit-pong-button">❌</button>
    <div id="pong-sketch"></div>
`;

document.getElementById('exit-pong-button')?.addEventListener('click', () => {
    const snakeGame = document.getElementById('pong-game')!;
    const mainContent = document.getElementById('main-content')!;

    if (snakeGame.style.display === 'block') {
        snakeGame.style.display = 'none';
        mainContent.style.display = 'block';
    } else {
        snakeGame.style.display = 'block';
        mainContent.style.display = 'none';
    }
});

new p5(sketch => {
    const p = sketch as unknown as p5;

    const playBounds = Bounds.create(Vector.create(0, 0), Vector.create(500, 250));

    let ballPosition = Vector.create(100, 100);
    let ballVelocity = Vector.create(-1, 0.5).times(2);
    const ballRadius = 5;
    
    let playerOneScore = 0;
    let playerTwoScore = 0;

    p.setup = function setup() {
        p.createCanvas(...playBounds.size);
        p.colorMode(p.HSB, 360, 100, 100, 100);
        p.noStroke();
    };

    p.draw = function draw() {
        p.background(240, 90, 60);

        p.stroke(240, 60, 100);

        p.strokeWeight(2);
        p.noFill();

        // Draw walls
        const [playWidth, playHeight] = playBounds.size;
        const horizontalCenter = playWidth / 2;
        const wallOffset = 10;
 
        lineDash([10])

        p.line(horizontalCenter, wallOffset, horizontalCenter, playHeight - wallOffset);

        lineDash([]) // reset the line dash

        p.line(0, 10, playWidth, 10);
        p.line(0, playHeight - wallOffset, playWidth, playHeight - wallOffset);

        // Draw paddles
        const paddleSize = 20;
        p.strokeWeight(4);

        // Paddle One
        const paddleOnePosition = p.mouseY;
        const paddleOneX = wallOffset;
        p.line(
            paddleOneX, paddleOnePosition - paddleSize / 2,
            paddleOneX, paddleOnePosition + paddleSize / 2
        );

        // Paddle Two
        const paddleTwoPosition = ballPosition.y;
        const paddleTwoX = playWidth - wallOffset;
        p.line(
            paddleTwoX, paddleTwoPosition - paddleSize / 2,
            paddleTwoX, paddleTwoPosition + paddleSize / 2
        );

        // Draw ball

        // Bouce off walls
        if (ballPosition.y + ballRadius >= playBounds.max.y - wallOffset) {
            ballVelocity = Vector.create(ballVelocity.x, -ballVelocity.y)
        }

        if (ballPosition.y - ballRadius <= playBounds.min.y + wallOffset) {
            ballVelocity = Vector.create(ballVelocity.x, -ballVelocity.y)
        }

        // Bouce off backboards
        if (ballPosition.x + ballRadius >= playBounds.max.x) {
            // ballVelocity = Vector.create(-ballVelocity.x, ballVelocity.y)
            playerOneScore += 1;
            ballPosition = Vector.create(100, 100);
            ballVelocity = Vector.create(-1, 0.5).times(2);
        }

        if (ballPosition.x - ballRadius <= playBounds.min.x) {
            // ballVelocity = Vector.create(-ballVelocity.x, ballVelocity.y)
            playerTwoScore += 1;
            ballPosition = Vector.create(100, 100);
            ballVelocity = Vector.create(1, 0.5).times(2);

        }

        // Bounce off paddles

        // Bounce off paddle one
        if (ballPosition.x - ballRadius <= paddleOneX
            && ballPosition.y >= paddleOnePosition - paddleSize / 2
            && ballPosition.y <= paddleOnePosition + paddleSize / 2) {
            ballVelocity = Vector.create(-ballVelocity.x, ballVelocity.y)
        }

        // Bounce off paddle two
        if (ballPosition.x + ballRadius >= paddleTwoX
            && ballPosition.y >= paddleTwoPosition - paddleSize / 2
            && ballPosition.y <= paddleTwoPosition + paddleSize / 2) {
            ballVelocity = Vector.create(-ballVelocity.x, ballVelocity.y)
        }

        ballPosition = ballPosition.plus(ballVelocity);

        p.strokeWeight(2);
        p.circle(ballPosition.x, ballPosition.y, ballRadius * 2);

        // Draw scores
        const textCenterOffset = 5;
        p.fill(255);
        p.textSize(25);
        p.textAlign(p.RIGHT);
        p.text(playerOneScore, playWidth / 2 - textCenterOffset, 30);
        p.textAlign(p.LEFT);
        p.text(playerTwoScore, playWidth / 2 + textCenterOffset, 30);
    }

    function lineDash(array: number[]) {
        p.drawingContext.setLineDash(array);
    }
}, document.getElementById('pong-sketch')!)