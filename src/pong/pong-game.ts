import Vector from '../Vector/Vector';
import World from '../ecs/World/World';
import { ScoreComponent, PrimitiveShape, Position, Velocity, BallComponent, BackboardComponent, Collision, Speed, PaddleComponent } from './components';
import collisionSystem, { collisionCleanupSystem, collisionLoggingSystem } from './collision/collision-system';
import castRay from './collision/cast-ray';
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
    for (const [velocity, collision] of world.query<[Velocity, Collision, BallComponent]>(['velocity', 'collision', 'ball'])) {
        velocity.velocity = velocity.velocity.reflect(collision.normal);
    }
}

function paddleCollisionHandlingSystem(world: World) {
    // const [, ballSpeed] = world.query<[Velocity, Speed, BallComponent]>(['velocity', 'speed', 'ball'])[0]; 

    // Describes bow the collision handling worked in the orginial pong game
    // https://www.vbforums.com/showthread.php?634246-RESOLVED-How-did-collision-in-the-original-Pong-happen

    for (const {} of world.query<[Collision, PaddleComponent]>(['collision', 'paddle'])) {

        // Buggy so commented it out for now: Seems to be randomly speeding up heaps
        // Increase ball velocity by 10%
        // ballSpeed.value += ballSpeed.value * 0.1;
        // console.log('ball speed', ballSpeed.value)

        if (sound) {
            ballHitAudio.play();
        }
    }
}

function backboardCollisionHandlingSystem(world: World) {
    for (const [backboard] of world.query<[BackboardComponent, Collision]>(['backboard', 'collision'])) {
        const [ballPosition, ballVelocity, ballSpeed] = world.query<[Position, Velocity, Speed, BallComponent]>(['position', 'velocity', 'speed', 'ball'])[0];

        ballPosition.position = Vector.create(200, 40);

        if (backboard.owner == 'player') {
            const [score, primitive] = world.query<[ScoreComponent, PrimitiveShape]>(['score', 'primitive', 'player-score'])[0];
            score.value += 1;
            if (primitive.type === 'text') {
                primitive.text = String(score.value);
            }

            ballVelocity.velocity =  new Vector(-0.5, -0.5);
        }

        if (backboard.owner == 'ai') {
            const [score, primitive] = world.query<[ScoreComponent, PrimitiveShape]>(['score', 'primitive', 'ai-score'])[0];
            score.value += 1;
            if (primitive.type === 'text') {
                primitive.text = String(score.value);
            }

            ballVelocity.velocity =  new Vector(0.5, -0.5);
        }

        ballSpeed.value = 3
    }
}

function aiPaddleSystem(world: World) {
    const [targetPosition] = world.query<[Position]>(['position', 'ai-paddle-target'])[0];
    for (const [position, speed] of world.query<[Position, Speed]>(['position', 'speed', 'paddle', 'ai'])) {

        // Cant just move it to where the ball is, need to move it to where the ball is going to be when it hits on the ai side
        position.position = position.position.plus(Vector.create(0, (targetPosition.position.y - position.position.y) * speed.value))

        if (position.position.y < 20) {
            position.position = Vector.create(position.position.x, 20);
        }

        if (position.position.y > 230) {
            position.position = Vector.create(position.position.x, 230);
        }
    }
}

function playerPaddleSystem(world: World) {
    const [mousePosition] = world.query<[MousePositionComponent]>(['mouse-position'])[0];

    for (const [position] of world.query<[Position]>(['position', 'paddle', 'player'])) {
        const positionChange = mousePosition.y - position.position.y
        position.position = position.position.plus(Vector.create(0, positionChange));
        
        if (position.position.y < 20) {
            position.position = Vector.create(position.position.x, 20);
        }

        if (position.position.y > 230) {
            position.position = Vector.create(position.position.x, 230);
        }
    }
}

function ballMovementSystem(world: World) {
    const [velocity, position, speed] = world.query<[Velocity, Position, Speed, BallComponent]>(['velocity', 'position', 'speed', 'ball', ])[0];

    position.position = position.position.plus(velocity.velocity.times(speed.value));
}

type TrajectoryLineSegmentComponent = Component & { name: 'trajectory-line-segment' };

function ballTrajectorySystem(world: World) {
    const [targetPosition] = world.query<[Position]>(['position', 'ai-paddle-target'])[0];

    const [ballPosition, ballVelocity] = world.query<[Position, Velocity, BallComponent]>(['position', 'velocity', 'ball'])[0];

    for (const [entityId] of world.query<[string, TrajectoryLineSegmentComponent]>(['entity-id', 'trajectory-line'])) {
        world.removeEntity(entityId);
    }

    const bounces = 20;
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

        const hitEntity = world.entity(hit.entityId);

        const backBoardComponent = hitEntity.components.find(comp => comp.name === 'backboard') as BackboardComponent | undefined;

        if (backBoardComponent && backBoardComponent.owner === 'ai') {
            targetPosition.position = hit.position;
            break;
        }

        start = end;
        direction = direction.reflect(hit.normal).normalised();

        linesAdded += 1;
        
    }
    
}

new Engine(document.getElementById('pong-sketch')!)
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
