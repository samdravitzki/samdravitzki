import p5 from 'p5';
import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>dravitzki.com</h1>
    <div id="sketch"></div>
  </div>
`

/**
 * The % operator in Javascript is called the remainder operator and you can use this to create
 * a modulo operator. I was confused by this as I orignally thought that % was a modulo operation
 * as I was no aware there was a difference
 * 
 * More infomation can be found at https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
 */
function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

type Direction = 'north' | 'east' | 'south' | 'west';
type Position = { x: number, y: number };

class SnakeChunk {
  position: Position;

  constructor(position: Position) {
    this.position = position;
  }

  
  
}

new p5(sketch => {
  const p = sketch as unknown as p5;

  const playBoundsX = 500;
  const playBoundsY = 500;

  let position: Position = { x: 100, y: 100 };
  let slitheringDirection: Direction = 'south';
  let snakeLength = 22;


  p.setup = function setup() {
    p.createCanvas(playBoundsX, playBoundsY);

    setInterval(onSlitherInterval, 100);
  };

  p.draw = function draw() {
    p.background(0);
    p.fill(205);
    p.rect(position.x, position.y, 10, 10);
  };

  function onSlitherInterval() {
    const stepSize = 10;

    switch (slitheringDirection) {
      case 'north':
        position.y = mod((position.y - stepSize), playBoundsY);
        break;
      case 'east':
        position.x = mod((position.x + stepSize), playBoundsX);
        break;
      case 'south':
        position.y = mod((position.y + stepSize), playBoundsY);
        break;
      case 'west':
        position.x = mod((position.x - stepSize), playBoundsX);
        break;
    }
  }

  p.keyPressed = function keyPressed() {
    switch (p.key) {
      case 'w':
        slitheringDirection = 'north';
        break;
      case 'd':
        slitheringDirection = 'east';
        break;
      case 's':
        slitheringDirection = 'south';
        break;
      case 'a':
        slitheringDirection = 'west';
        break;
    }
  }

}, document.getElementById('sketch')!)
