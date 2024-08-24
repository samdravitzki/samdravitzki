import World from '../../ecs/World/World';
import { Position, Collider, Collision } from '../components';
import castRay from './castRay';
import aabbAabbIntersection, { Aabb } from './intersection/aabb-aabb-intersection';


function collisionSystem(world: World) {
    const colliders = world.query(['position', 'collider']) as [Position, Collider][];

    for (const [positionA, colliderA] of colliders) {
        for (const [positionB, colliderB] of colliders) {

            if (positionA.entityId === positionB.entityId) {
                // Exclude collisions with itself
                continue;
            }

            if (colliderA.type === 'aabb' && colliderB.type === 'aabb') {
                const aabb1: Aabb = {
                    position: positionA.position,
                    width: colliderA.width,
                    height: colliderA.height,
                };

                const aabb2: Aabb = {
                    position: positionB.position,
                    width: colliderB.width,
                    height: colliderB.height,
                };

                const intersection = aabbAabbIntersection(aabb1, aabb2);

                if (intersection) {
                    const collision: Collision = {
                        entityId: colliderA.entityId,
                        name: 'collision',
                        contactPoint: intersection.contactPoint, // Contact point on a AABB is just its local origin
                        normal: intersection.normal,
                        penetration: intersection.penetration,
                    }

                    world.replaceComponent(collision)
                }
            }
        }
    }
}

function collisionLoggingSystem(world: World) {
    for (const [collision] of world.query(['collision']) as [Collision][]) {
        console.log(JSON.stringify(collision))
    }
}

/**
 * Remove all the collisions that exist in the world
 * 
 * Designed to be used to cleanup the collisions at the end of tick so that collisions
 * are not left over after they have completed
 * @param world 
 */
function collisionCleanupSystem(world: World) {
    for (const [collision] of world.query(['collision']) as [Collision][]) {
        world.removeComponent(collision);
    }
}

export {
    collisionCleanupSystem,
    collisionLoggingSystem,
    collisionSystem,
    castRay,
}
