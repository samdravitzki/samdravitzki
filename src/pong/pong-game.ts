import Vector from '../Vector/Vector';
import World from '../ecs/World/World';
import { ScoreComponent, PrimitiveShape, Position, Velocity, BallComponent, BackboardComponent, Collision, Speed, PaddleComponent, PlayerComponent } from './components';
import collisionSystem, { collisionCleanupSystem, collisionLoggingSystem } from './collision/collision-system';
import castRay from './collision/castRay';
import Engine, { MousePositionComponent } from './Engine';
import createBundle from '../ecs/Bundle/createBundle';
import minionBongUrl from './sounds/minion-bong.mp3';
import Component from '../ecs/Component/Component';
import setupBoundaries from './setup-boundaries';
import setupBall from './setup-ball';
import setupPaddles from './setup-paddles';
import setupScoreboard from './setup-scoreboard';

const ballHitAudio = new Audio(minionBongUrl);

const sound = false;

function ballCollisionHandlingSystem(world: World) {
    for (const [velocity, collision] of world.query(['velocity', 'collision', 'ball']) as [Velocity, Collision, BallComponent][]) {
        velocity.velocity = velocity.velocity.reflect(collision.normal);
    }
}

function paddleCollisionHandlingSystem(world: World) {
    const [paddleSpeed] = world.query(['speed', 'paddle', 'player'])[0] as [Speed, PaddleComponent, PlayerComponent];
    const [ballVelocity] = world.query(['velocity', 'ball'])[0] as [Velocity, BallComponent]

    for (const [] of world.query(['velocity', 'collision', 'paddle']) as [Velocity, Collision, BallComponent][]) {
        ballVelocity.velocity = ballVelocity.velocity.plus(Vector.create(paddleSpeed.value / 20, paddleSpeed.value / 10));

        if (sound) {
            ballHitAudio.play();
        }
    }
}

function backboardCollisionHandlingSystem(world: World) {
    for (const [backboard] of world.query(['backboard', 'collision']) as [BackboardComponent, Collision][]) {
        const [ballPosition, ballVelocity] = world.query(['position', 'velocity', 'ball'])[0] as [Position, Velocity, BallComponent];

        ballPosition.position = Vector.create(200, 40);

        if (backboard.owner == 'player') {
            const [score, primitive] = world.query(['score', 'primitive', 'player-score'])[0] as [ScoreComponent, PrimitiveShape];
            score.value += 1;
            if (primitive.type === 'text') {
                primitive.text = String(score.value);
            }

            ballVelocity.velocity =  new Vector(-0.5, -0.5);
        }

        if (backboard.owner == 'ai') {
            const [score, primitive] = world.query(['score', 'primitive', 'ai-score'])[0] as [ScoreComponent, PrimitiveShape];
            score.value += 1;
            if (primitive.type === 'text') {
                primitive.text = String(score.value);
            }

            ballVelocity.velocity =  new Vector(0.5, -0.5);
        }
    }
}

function aiPaddleSystem(world: World) {
    for (const [position, speed] of world.query(['position', 'speed', 'paddle', 'ai']) as [Position, Speed][]) {
        const [ballPosition] = world.query(['position', 'ball'])[0] as [Position, BallComponent];

        // Cant just move it to where the ball is, need to move it to where the ball is going to be when it hits on the ai side
        position.position = position.position.plus(Vector.create(0, (ballPosition.position.y - position.position.y) * speed.value))

        if (position.position.y < 20) {
            position.position = Vector.create(position.position.x, 20);
        }

        if (position.position.y > 230) {
            position.position = Vector.create(position.position.x, 230);
        }
    }
}

function playerPaddleSystem(world: World) {
    const [mousePosition] = world.query(['mouse-position'])[0] as [MousePositionComponent];

    for (const [position, speed] of world.query(['position', 'speed', 'paddle', 'player']) as [Position, Speed][]) {
        const positionChange = mousePosition.y - position.position.y
        position.position = position.position.plus(Vector.create(0, positionChange));

        speed.value = positionChange;
        
        if (position.position.y < 20) {
            position.position = Vector.create(position.position.x, 20);
        }

        if (position.position.y > 230) {
            position.position = Vector.create(position.position.x, 230);
        }
    }
}

function ballMovementSystem(world: World) {
    const [velocity, position, speed] = world.query(['velocity', 'position', 'speed', 'ball', ])[0] as [Velocity, Position, Speed, BallComponent];

    position.position = position.position.plus(velocity.velocity.times(speed.value));
}

type TrajectoryLineSegmentComponent = Component & { name: 'trajectory-line-segment' };

function ballTrajectorySystem(world: World) {
    const [ballPosition, ballVelocity] = world.query(['position', 'velocity', 'ball'])[0] as [Position, Velocity, BallComponent];

    for (const [segment] of world.query(['trajectory-line']) as [TrajectoryLineSegmentComponent][]) {
        world.removeEntity(segment.entityId);
    }

    const bounces = 4;
    let linesAdded = 0;

    // Issue: when the ball is moving really slow the ball dissapears

    // Start the ray a little back from the start of the center of the ball to mitigate issues with tunneling
    let start = ballPosition.position.minus(ballVelocity.velocity.normalised().times(10));
    let direction = ballVelocity.velocity;

    // render trajectory line of each collision
    while(linesAdded < bounces) {
        const hit = castRay(world, {
            position: start,
            direction,
            length: 1000,
        }, { layer: 'wall' })[0];

        if (!hit) {
            break;
        }

        const end = hit.position;

        world.addBundle(createBundle([
            'trajectory-line',
            {
                name: 'position',
                position: start,
            },
            {
                name: 'primitive',
                stroke: [(111 + 50 * linesAdded) % 255, 100, 100],
                strokeWeight: 2,
                type: 'line',
                start: Vector.create(0, 0),
                end: end.minus(start),
            }
        ]));

        start = end;
        direction = direction.reflect(hit.normal).normalised();

        linesAdded += 1;
    }
    
}

new Engine(document.getElementById('pong-sketch')!)
    .setWorld(new World())
    .addSystem('start', setupBall)
    .addSystem('start', setupPaddles)
    .addSystem('start', setupBoundaries)
    .addSystem('start', setupScoreboard) 
    .addSystem('update', collisionSystem)
    .addSystem('update', collisionLoggingSystem)
    .addSystem('update', ballCollisionHandlingSystem)
    .addSystem('update', backboardCollisionHandlingSystem)
    .addSystem('update', paddleCollisionHandlingSystem)
    .addSystem('update', playerPaddleSystem)
    .addSystem('update', aiPaddleSystem)
    .addSystem('update', ballMovementSystem)
    .addSystem('update', ballTrajectorySystem)
    .addSystem('update', collisionCleanupSystem)
    .run()
