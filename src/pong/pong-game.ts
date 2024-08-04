import Vector from '../Vector/Vector';
import World from '../ecs/World/World';
import { ScoreComponent, PrimitiveShape, Position, Velocity, BallComponent, BackboardComponent, Collision } from './components';
import { collisionCleanupSystem, collisionLoggingSystem, collisionSystem } from './collision-system';
import Engine from './Engine';
import createBundle from '../ecs/Bundle/createBundle';
import meowUrl from './meow-1.mp3';


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

const ballBundle = createBundle([
    'ball',
    {
        name: 'primitive',
        stroke: [240, 60, 100],
        strokeWeight: 2,
        fill: false,
        type: 'circle',
        radius: 5
    },
    {
        name: 'position',
        position: new Vector(200, 40),
    },
    {
        name: 'velocity',
        velocity: new Vector(1, 0.15),
    },
    {
        name: 'speed',
        value: 3,
    },
    {
        name: 'collider',
        type: 'aabb',
        width: 10,
        height: 10
    }
]);

const leftPaddleBundle = createBundle([
    'player',
    'paddle',
    {
        name: 'primitive',
        fill: [240, 60, 100],
        type: 'square',
        width: 5,
        height: 20
    },
    {
        name: 'position',
        position: new Vector(10, 50),
    },
    {
        name: 'collider',
        type: 'aabb',
        width: 5,
        height: 20
    },

]);

const rightPaddleBundle = createBundle([
    'ai',
    'paddle',
    {
        name: 'primitive',
        fill: [240, 60, 100],
        type: 'square',
        width: 5,
        height: 20
    },
    {
        name: 'position',
        position: new Vector(490, 70),
    },
    {
        name: 'collider',
        type: 'aabb',
        width: 5,
        height: 20
    }
]);

const northWallBundle = createBundle([
    {
        name: 'primitive',
        fill:  [240, 60, 100],
        type: 'square',
        width: 500,
        height: 10
    },
    {
        name: 'position',
        position: new Vector(250, 5),
    },
    {
        name: 'collider',
        type: 'aabb',
        width: 500,
        height: 10
    }
]);

const southWallBundle = createBundle([
    {
        name: 'primitive',
        fill:  [240, 60, 100],
        type: 'square',
        width: 500,
        height: 10
    },
    {
        name: 'position',
        position: new Vector(250, 245),
    },
    {
        name: 'collider',
        type: 'aabb',
        width: 500,
        height: 10
    },
]);

const centerLineBundle = createBundle([
    {
        name: 'primitive',
        stroke: [240, 60, 100],
        strokeWeight: 2,
        fill:  [240, 60, 100],
        type: 'line',
        start: new Vector(0, -125),
        end: new Vector(0, 125)
    },
    {
        name: 'position',
        position: new Vector(250, 125),
    },
]);

const leftBackboardBundle = createBundle([
    {
        name: 'primitive',
        fill:  [352, 94, 100],
        type: 'square',
        width: 5,
        height: 250
    },
    {
        name: 'position',
        position: new Vector(2.5, 125),
    },
    {
        name: 'collider',
        type: 'aabb',
        width: 5,
        height: 230
    },
    {
        name: 'backboard',
        owner: 'player',
    },
]);

const rightBackboardBundle = createBundle([
    {
        name: 'primitive',
        fill:  [352, 94, 100],
        type: 'square',
        width: 5,
        height: 250
    },
    {
        name: 'position',
        position: new Vector(497.5, 125),
    },
    {
        name: 'collider',
        type: 'aabb',
        width: 5,
        height: 230
    },
    {
        name: 'backboard',
        owner: 'ai',
    },
]);

const playerScoreBundle = createBundle([
    'player-score',
    {
        name: 'score',
        value: 0,
    },
    {
        name: 'position',
        position: new Vector(245, 35),
    },
    {
        name: 'primitive',
        stroke: [240, 60, 100],
        strokeWeight: 2,
        fill: [240, 60, 100],
        type: 'text',
        text: '0',
        align: 'right',
        size: 25,
    }
]);

const aiScoreBundle = createBundle([
    'ai-score',
    {
        name: 'score',
        value: 0,
    },
    {
        name: 'position',
        position: new Vector(255, 35),
    },
    {
        name: 'primitive',
        stroke: [240, 60, 100],
        strokeWeight: 2,
        fill: [240, 60, 100],
        type: 'text',
        text: '0',
        align: 'left',
        size: 25,
    }
]);

const world = new World();

world.addBundle(ballBundle);
world.addBundle(leftPaddleBundle);
world.addBundle(rightPaddleBundle);
world.addBundle(northWallBundle);
world.addBundle(southWallBundle);
world.addBundle(centerLineBundle);
world.addBundle(leftBackboardBundle);
world.addBundle(rightBackboardBundle);
world.addBundle(playerScoreBundle);
world.addBundle(aiScoreBundle);

function ballCollisionHandlingSystem(world: World) {
    for (const [velocity, collision] of world.query(['velocity', 'collision', 'ball']) as [Velocity, Collision, BallComponent][]) {
        velocity.velocity = velocity.velocity.reflect(collision.normal);

        const meow = new Audio(meowUrl);
        meow.play();
    }
}

function backboardCollisionHandlingSystem(world: World) {
    for (const [backboard] of world.query(['backboard', 'collision']) as [BackboardComponent, Collision][]) {
        const [ballPosition] = world.query(['position', 'ball'])[0] as [Position, BallComponent];

        ballPosition.position = new Vector(200, 40);

        if (backboard.owner == 'player') {
            const [score, primitive] = world.query(['score', 'primitive', 'player-score'])[0] as [ScoreComponent, PrimitiveShape];
            score.value += 1;
            if (primitive.type === 'text') {
                primitive.text = String(score.value);
            }
        }

        if (backboard.owner == 'ai') {
            const [score, primitive] = world.query(['score', 'primitive', 'ai-score'])[0] as [ScoreComponent, PrimitiveShape];
            score.value += 1;
            if (primitive.type === 'text') {
                primitive.text = String(score.value);
            }
        }
    }
}

function aiPaddleSystem(world: World) {
    for (const [position] of world.query(['position', 'paddle', 'ai']) as [Position][]) {
        const [ballPosition] = world.query(['position', 'ball'])[0] as [Position, BallComponent];

        position.position = new Vector(position.position.x, ballPosition.position.y)
    }
}

function ballMovementSystem(world: World) {
    const [velocity, position, speed] = world.query(['velocity', 'position', 'speed', 'ball', ])[0] as [Velocity, Position, { name: 'speed'; value: number }, BallComponent];
    position.position = position.position.plus(velocity.velocity.times(speed.value));
}


new Engine(document.getElementById('pong-sketch')!)
    .setWorld(world)
    .addSystem(collisionSystem)
    .addSystem(collisionLoggingSystem)
    .addSystem(ballCollisionHandlingSystem)
    .addSystem(backboardCollisionHandlingSystem)
    .addSystem(aiPaddleSystem)
    .addSystem(ballMovementSystem)
    .addSystem(collisionCleanupSystem)
    .run()
