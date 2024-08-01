import World from '../ecs/World/World';
import Vector from '../Vector/Vector';
import { Position, Collider, Collision } from './components';

export function collisionSystem(world: World) {
    const colliders = world.query(['position', 'collider']) as [Position, Collider][];

    for (const [positionA, colliderA] of colliders) {
        for (const [positionB, colliderB] of colliders) {

            if (positionA.entityId === positionB.entityId) {
                // Exclude collisions with itself
                continue;
            }

            if (colliderA.type === 'aabb' && colliderB.type === 'aabb') {
                // From https://research.ncl.ac.uk/game/mastersdegree/gametechnologies/physicstutorials/4collisiondetection/Physics%20-%20Collision%20Detection.pdf
                const deltaPosition = positionA.position.minus(positionB.position);
                const combinedWidth = (colliderA.width + colliderB.width) / 2;
                const combinedHeight = (colliderA.height + colliderB.height) / 2;

                if (Math.abs(deltaPosition.x) < combinedWidth && Math.abs(deltaPosition.y) < combinedHeight) {
                    const sqaureFaces = [
                        new Vector(0, 1), // top
                        new Vector(1, 0), // right
                        new Vector(0, -1), // bottom
                        new Vector(-1, 0), // left
                    ];

                    const colliderAMaximumPoint = new Vector(
                        positionA.position.x + colliderA.width / 2,
                        positionA.position.y + colliderA.height / 2,
                    );

                    const colliderAMinimumPoint = new Vector(
                        positionA.position.x - colliderA.width / 2,
                        positionA.position.y - colliderA.height / 2,
                    );

                    const colliderBMaximumPoint = new Vector(
                        positionB.position.x + colliderB.width / 2,
                        positionB.position.y + colliderB.height / 2,
                    );

                    const colliderBMinimumPoint = new Vector(
                        positionB.position.x - colliderB.width / 2,
                        positionB.position.y - colliderB.height / 2,
                    );

                    const distances = [
                        (colliderAMaximumPoint.y - colliderBMinimumPoint.y), // Distance from 'top' of 'a' to 'bottom' of 'b'
                        (colliderAMaximumPoint.x - colliderBMinimumPoint.x), // Distance from 'right' of 'a' to 'left' of 'b'
                        (colliderBMaximumPoint.y - colliderAMinimumPoint.y), // Distance from 'bottom' of 'a' to 'top' of 'b'
                        (colliderBMaximumPoint.x - colliderAMinimumPoint.x), // Distance from 'left' of 'a' to 'right' of 'b'
                    ];

                    let bestAxis: Vector = new Vector(0, 0);
                    let penetration: number = Infinity;

                    for (let i = 0; i < 6; i++) {
                        if (distances[i] < penetration) {
                            penetration = distances[i];
                            bestAxis = sqaureFaces[i];
                        }
                    }

                    const collision: Collision = {
                        entityId: colliderA.entityId,
                        name: 'collision',
                        contactPoint: new Vector(0, 0), // Contact point on a AABB is just its local origin
                        normal: bestAxis,
                        penetration: penetration,
                    }

                    world.replaceComponent(collision)
                }
            }
        }
    }
}

export function collisionLoggingSystem(world: World) {
    for (const [col] of world.query(['collision']) as [Collision][]) {
        console.log(JSON.stringify(col))
    }
}

