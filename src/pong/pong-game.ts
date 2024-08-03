import Vector from '../Vector/Vector';
import Entity from '../ecs/Entity/Entity';
import World from '../ecs/World/World';
import { ScoreComponent, PrimitiveShape, Position, Velocity, Collider, BallComponent, PaddleComponent, PlayerComponent, AiComponent, BackboardComponent, Collision } from './components';
import { collisionCleanupSystem, collisionLoggingSystem, collisionSystem } from './collision-system';
import App from './App';


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

// It is already getting really difficult to manage all the logic so I want to introduce some design to make things easier to manange.
// To do this I am going to try using the ecs design pattern purely for the structure it provides
// Main resource: https://bevy-cheatbook.github.io/programming/ecs-intro.html





// Entities
const ball = new Entity();
const leftPaddle = new Entity();
const rightPaddle = new Entity();
const northWall = new Entity();
const southWall = new Entity();
const leftBackboard = new Entity();
const rightBackboard = new Entity();
const centerLine = new Entity();
const playerScore = new Entity();
const aiScore = new Entity();

const playerScoreComponent: ScoreComponent = {
    entityId: playerScore.id,
    name: 'score',
    value: 0,
}


const ballShape: PrimitiveShape = {
    entityId: ball.id,
    name: 'primitive',
    stroke: [240, 60, 100],
    strokeWeight: 2,
    fill: false,
    type: 'circle',
    radius: 5
};

const ballPosition: Position = {
    entityId: ball.id,
    name: 'position',
    position: new Vector(200, 40),
};

const ballVelocity: Velocity = {
    entityId: ball.id,
    name: 'velocity',
    velocity: new Vector(1, 0.15),
}

const ballCollider: Collider = {
    entityId: ball.id,
    name: 'collider',
    type: 'aabb',
    width: 10,
    height: 10
};

const ballComponent: BallComponent = {
    entityId: ball.id,
    name: 'ball',
}

const leftPaddleShape: PrimitiveShape = {
    entityId: leftPaddle.id,
    name: 'primitive',
    fill: [240, 60, 100],
    type: 'square',
    width: 5,
    height: 20
}

const leftPaddlePosition: Position = {
    entityId: leftPaddle.id,
    name: 'position',
    position: new Vector(10, 50),
}

const leftPaddleCollider: Collider = {
    entityId: leftPaddle.id,
    name: 'collider',
    type: 'aabb',
    width: 5,
    height: 20
};

const leftPaddleComponent: PaddleComponent = {
    entityId: leftPaddle.id,
    name: 'paddle',
}

const leftPaddlePlayerComponent: PlayerComponent = {
    entityId: leftPaddle.id,
    name: 'player',
}

const rightPaddleShape: PrimitiveShape = {
    entityId: rightPaddle.id,
    name: 'primitive',
    fill: [240, 60, 100],
    type: 'square',
    width: 5,
    height: 20
}

const rightPaddlePosition: Position = {
    entityId: rightPaddle.id,
    name: 'position',
    position: new Vector(490, 70),
}

const rightPaddleCollider: Collider = {
    entityId: rightPaddle.id,
    name: 'collider',
    type: 'aabb',
    width: 5,
    height: 20
};

const rightPaddleComponent: PaddleComponent = {
    entityId: rightPaddle.id,
    name: 'paddle',
}

const rightPaddleAiComponent: AiComponent = {
    entityId: rightPaddle.id,
    name: 'ai',
}

const northWallShape: PrimitiveShape = {
    entityId: northWall.id,
    name: 'primitive',
    fill:  [240, 60, 100],
    type: 'square',
    width: 500,
    height: 10
};

const northWallPosition: Position = {
    entityId: northWall.id,
    name: 'position',
    position: new Vector(250, 5),
};

const northWallCollider: Collider = {
    entityId: northWall.id,
    name: 'collider',
    type: 'aabb',
    width: 500,
    height: 10
};

const southWallShape: PrimitiveShape = {
    entityId: southWall.id,
    name: 'primitive',
    fill:  [240, 60, 100],
    type: 'square',
    width: 500,
    height: 10
};

const southWallPosition: Position = {
    entityId: southWall.id,
    name: 'position',
    position: new Vector(250, 245),
};

const southWallCollider: Collider = {
    entityId: southWall.id,
    name: 'collider',
    type: 'aabb',
    width: 500,
    height: 10
};

const centerLineShape: PrimitiveShape = {
    entityId: centerLine.id,
    name: 'primitive',
    stroke: [240, 60, 100],
    strokeWeight: 2,
    fill:  [240, 60, 100],
    type: 'line',
    start: new Vector(0, -125),
    end: new Vector(0, 125)
};

const centerLinePosition: Position = {
    entityId: centerLine.id,
    name: 'position',
    position: new Vector(250, 125),
};

const leftBackboardShape: PrimitiveShape = {
    entityId: leftBackboard.id,
    name: 'primitive',
    fill:  [352, 94, 100],
    type: 'square',
    width: 5,
    height: 250
};

const leftBackboardPosition: Position = {
    entityId: leftBackboard.id,
    name: 'position',
    position: new Vector(2.5, 125),
};

const leftBackboardCollider: Collider = {
    entityId: leftBackboard.id,
    name: 'collider',
    type: 'aabb',
    width: 5,
    height: 230
};

const leftBackboardComponent: BackboardComponent = {
    entityId: leftBackboard.id,
    name: 'backboard',
    owner: 'player',
}

const rightBackboardShape: PrimitiveShape = {
    entityId: rightBackboard.id,
    name: 'primitive',
    fill:  [352, 94, 100],
    type: 'square',
    width: 5,
    height: 250
};

const rightBackboardPosition: Position = {
    entityId: rightBackboard.id,
    name: 'position',
    position: new Vector(497.5, 125),
};

const rightBackboardCollider: Collider = {
    entityId: rightBackboard.id,
    name: 'collider',
    type: 'aabb',
    width: 5,
    height: 230
};

const rightBackboardComponent: BackboardComponent = {
    entityId: rightBackboard.id,
    name: 'backboard',
    owner: 'ai'
}



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

world.addEntity(ball);
world.addComponent(ballShape);
world.addComponent(ballPosition);
world.addComponent(ballCollider);
world.addComponent(ballVelocity);
world.addComponent(ballComponent);

world.addEntity(leftPaddle);
world.addComponent(leftPaddleShape);
world.addComponent(leftPaddlePosition);
world.addComponent(leftPaddleCollider);
world.addComponent(leftPaddleComponent);
world.addComponent(leftPaddlePlayerComponent);

world.addEntity(rightPaddle);
world.addComponent(rightPaddleShape);
world.addComponent(rightPaddlePosition);
world.addComponent(rightPaddleCollider);
world.addComponent(rightPaddleComponent);
world.addComponent(rightPaddleAiComponent);

world.addEntity(northWall);
world.addComponent(northWallShape);
world.addComponent(northWallPosition);
world.addComponent(northWallCollider);

world.addEntity(southWall);
world.addComponent(southWallShape);
world.addComponent(southWallPosition);
world.addComponent(southWallCollider);

world.addEntity(centerLine);
world.addComponent(centerLinePosition);
world.addComponent(centerLineShape);

world.addEntity(leftBackboard);
world.addComponent(leftBackboardShape);
world.addComponent(leftBackboardPosition);
world.addComponent(leftBackboardCollider);
world.addComponent(leftBackboardComponent);

world.addEntity(rightBackboard);
world.addComponent(rightBackboardShape);
world.addComponent(rightBackboardPosition);
world.addComponent(rightBackboardCollider);
world.addComponent(rightBackboardComponent);

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
