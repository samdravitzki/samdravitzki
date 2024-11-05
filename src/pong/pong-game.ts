import p5 from 'p5';
import Vector from '../Vector/Vector';
import World from '../ecs/World/World';
import { ScoreComponent, PrimitiveShape, Position, Velocity, BallComponent, BackboardComponent, Collision, Speed, PaddleComponent, TrajectoryLineSegmentComponent } from './components';
import collisionSystem, { collisionCleanupSystem, collisionLoggingSystem } from './collision/collision-system';
import castRay from './collision/cast-ray';
import Engine from './Engine';
import createBundle from '../ecs/Bundle/createBundle';
import minionBongUrl from './sounds/minion-bong.mp3';
import setupBoundaries from './setup-boundaries';
import setupBall from './setup-ball';
import setupPaddles from './setup-paddles';
import setupScoreboard from './setup-scoreboard';
import { MousePosition } from '../ecs/System/System';

const ballHitAudio = new Audio(minionBongUrl);

const sound = false;

function ballCollisionHandlingSystem(world: World) {
    for (const [velocity, collision, position] of world.query<[Velocity, Collision, Position, BallComponent]>(['velocity', 'collision', 'position', 'ball'])) {
        const collidee = world.entity(collision.entityId);

        velocity.velocity = velocity.velocity.reflect(collision.normal);
        
        if (collidee.components.find((c) => c.name === 'paddle')) {
            const paddlePosition = collidee.getComponent('position') as Position;

            const yDistanceFromPaddleCenter = paddlePosition.position.minus(position.position).y;

            velocity.velocity = Vector.create(velocity.velocity.x, -yDistanceFromPaddleCenter / 25);
        }
        
    }
}



// Describes bow the collision handling worked in the orginial pong game
// https://www.vbforums.com/showthread.php?634246-RESOLVED-How-did-collision-in-the-original-Pong-happen
function paddleCollisionHandlingSystem(world: World) {
    const [, ballSpeed] = world.query<[Velocity, Speed, BallComponent]>(['velocity', 'speed', 'ball'])[0]; 

    for (const [collision] of world.query<[Collision, PaddleComponent]>(['collision', 'paddle'])) {


        if (world.entity(collision.entityId).components.find((c) => c.name === 'ball')) {
            ballSpeed.value += ballSpeed.value * 0.1;
        }


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

// type System = (world: World, )

function playerPaddleSystem(world: World, { mousePosition }: { mousePosition: MousePosition }) {
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
            // {
            //     name: 'primitive',
            //     stroke: [(111 + 50 * linesAdded) % 255, 100, 100],
            //     strokeWeight: 2,
            //     type: 'line',
            //     start: Vector.create(0, 0),
            //     end: end.minus(start),
            // }
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

function renderSystem(world: World, { p }: { p: p5 }) {
    for (const [position, primitive] of world.query<[Position, PrimitiveShape]>(['position', 'primitive'])) {
        if (!primitive.strokeWeight) {
            p.strokeWeight(0);
        } else {
            p.strokeWeight(primitive.strokeWeight);
        }

        if (!primitive.stroke) {
            p.noStroke();
        } else {
            p.stroke(primitive.stroke);
        }

        if (!primitive.fill) {
            p.noFill()
        } else {
            p.fill(primitive.fill)
        }

        if (primitive.type === 'circle') {
            p.circle(position.position.x, position.position.y, primitive.radius * 2);
        }

        if (primitive.type === 'line') {
            p.line(
                primitive.start.x + position.position.x, primitive.start.y + position.position.y,
                primitive.end.x + position.position.x, primitive.end.y + position.position.y
            )
        }

        if (primitive.type === 'square') {
            p.rect(position.position.x, position.position.y, primitive.width, primitive.height)
        }

        if (primitive.type === 'text') {
            p.textSize(primitive.size);

            if (primitive.align === 'left') p.textAlign(p.LEFT);
            if (primitive.align === 'right') p.textAlign(p.RIGHT);

            p.text(primitive.text, position.position.x, position.position.y);
        }
    }

}

// function collisionRenderSystem(world: World, { p }: { p: p5 }) {
//     for (const [col, pos] of world.query(['collider', 'position']) as [Collider, Position][]) {
//         if (col.type === 'aabb') {
//             p.stroke(111, 100, 100);
//             p.strokeWeight(0.5)
//             p.noFill()
//             p.rect(pos.position.x, pos.position.y, col.width, col.height);
//         }
//     }
// }

// Pause functionality
// When the pause button is pressed
// 1. Freeze time
// 2. Disable any input from affecting anything that is paused

new Engine(document.getElementById('pong-sketch')!)
    .addSystems({ event: 'start' }, [
        setupBall,
        setupPaddles,
        setupBoundaries,
        setupScoreboard
    ])
    .addSystem({ event: 'update'}, renderSystem)
    // .addSystem({ event: 'update'}, collisionRenderSystem)
    .addSystems({ event: 'update', state: 'in-game' }, [
        collisionSystem,
        collisionLoggingSystem,
        ballCollisionHandlingSystem,
        backboardCollisionHandlingSystem,
        paddleCollisionHandlingSystem,
        playerPaddleSystem,
        aiPaddleSystem,
        ballMovementSystem,
        ballTrajectorySystem,
        collisionCleanupSystem,
    ])
    .addSystem({ event: 'update', state: 'in-game', trigger: 'on-enter' }, (world) => {
        const [primitive] = world.query<[PrimitiveShape, BallComponent]>(['primitive', 'ball'])[0];

        console.log('Triggered onEnter in-game')
        primitive.stroke = [10, 82, 56];
    })
    .addSystem({ event: 'update', state: 'main-menu', trigger: 'on-enter' }, (world) => {
        const [primitive] = world.query<[PrimitiveShape, BallComponent]>(['primitive', 'ball'])[0];

        console.log('Triggered onEnter menu')
        primitive.stroke = [240, 60, 100];
    })
    .run()
