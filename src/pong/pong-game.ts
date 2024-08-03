import Vector from '../Vector/Vector';
import Entity from '../ecs/Entity/Entity';
import World from '../ecs/World/World';
import { ScoreComponent, PrimitiveShape, Position, Velocity, Collider, BallComponent, PaddleComponent, PlayerComponent, AiComponent, BackboardComponent, Collision } from './components';
import { collisionCleanupSystem, collisionLoggingSystem, collisionSystem } from './collision-system';
import App from './App';
import createBundle from '../ecs/Bundle/createBundle';


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

// Entities
const southWall = new Entity();
const rightBackboard = new Entity();
const playerScore = new Entity();
const aiScore = new Entity();

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
        name: 'collider',
        type: 'aabb',
        width: 10,
        height: 10
    }
]);

const playerScoreComponent: ScoreComponent = {
    entityId: playerScore.id,
    name: 'score',
    value: 0,
}

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
        entityId: southWall.id,
        name: 'position',
        position: new Vector(250, 245),
    },
    {
        entityId: southWall.id,
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
        entityId: rightBackboard.id,
        name: 'primitive',
        fill:  [352, 94, 100],
        type: 'square',
        width: 5,
        height: 250
    },
    {
        entityId: rightBackboard.id,
        name: 'position',
        position: new Vector(497.5, 125),
    },
    {
        entityId: rightBackboard.id,
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


const playerScoreText: PrimitiveShape = {
    entityId: playerScore.id,
    name: 'primitive',
    stroke: [240, 60, 100],
    strokeWeight: 2,
    fill: [240, 60, 100],
    type: 'text',
    text: '0',
    align: 'right',
    size: 25,
}

const playerScorePosition: Position = {
    entityId: playerScore.id,
    name: 'position',
    position: new Vector(245, 35),
}

const aiScoreComponent: ScoreComponent = {
    entityId: aiScore.id,
    name: 'score',
    value: 0,
}

const aiScoreText: PrimitiveShape = {
    entityId: aiScore.id,
    name: 'primitive',
    stroke: [240, 60, 100],
    strokeWeight: 2,
    fill: [240, 60, 100],
    type: 'text',
    text: '0',
    align: 'left',
    size: 25,
}

const aiScorePosition: Position = {
    entityId: aiScore.id,
    name: 'position',
    position: new Vector(255, 35),
}



const world = new World();

world.addBundle(ballBundle);
world.addBundle(leftPaddleBundle);
world.addBundle(rightPaddleBundle);
world.addBundle(northWallBundle);
world.addBundle(southWallBundle);
world.addBundle(centerLineBundle);
world.addBundle(leftBackboardBundle);
world.addBundle(rightBackboardBundle);

world.addEntity(playerScore);
world.addComponent(playerScoreComponent);
world.addComponent(playerScorePosition);
world.addComponent(playerScoreText);
world.addComponent({
    entityId: playerScore.id,
    name: 'player-score'
});

world.addEntity(aiScore);
world.addComponent(aiScoreComponent);
world.addComponent(aiScorePosition);
world.addComponent(aiScoreText);
world.addComponent({
    entityId: aiScore.id,
    name: 'ai-score'
});

function ballCollisionHandlingSystem(world: World) {
    for (const res of world.query(['velocity', 'collision', 'ball']) as [Velocity, Collision, BallComponent][]) {

        const [ballV, ballCol] = res;
        if (ballCol.normal) {
            // From https://math.stackexchange.com/questions/13261/how-to-get-a-reflection-vector
            // I do not understand how this maths works
            ballV.velocity = ballV.velocity.reflect(ballCol.normal);
        }
    }
}

function backboardCollisionHandlingSystem(world: World) {
    for (const [backboard] of world.query(['backboard', 'collision']) as [BackboardComponent, Collision][]) {
        const [ballPosi] = world.query(['position', 'ball'])[0] as [Position, BallComponent];

        ballPosi.position = new Vector(200, 40);

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
    for (const [pos] of world.query(['position', 'paddle', 'ai']) as [Position][]) {
        const [ballPosi] = world.query(['position', 'ball'])[0] as [Position, BallComponent];

        pos.position = new Vector(pos.position.x, ballPosi.position.y)
    }
}

function ballMovementSystem(world: World) {
    const [ballVel, ballPos] = world.query(['velocity', 'position', 'ball'])[0] as [Velocity, Position, BallComponent];
    ballPos.position = ballPos.position.plus(ballVel.velocity);
}


new App(document.getElementById('pong-sketch')!)
    .setWorld(world)
    .addSystem(collisionSystem)
    .addSystem(collisionLoggingSystem)
    .addSystem(ballCollisionHandlingSystem)
    .addSystem(backboardCollisionHandlingSystem)
    .addSystem(aiPaddleSystem)
    .addSystem(ballMovementSystem)
    .addSystem(collisionCleanupSystem)
    .run()
