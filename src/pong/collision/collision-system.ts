import World from "../../ecs/World/World";
import { Position, Collider, Collision } from "../components";
import aabbAabbIntersection from "./intersection/aabb-aabb-intersection";
import { Aabb } from "./intersection/intersection-shapes";

function collisionSystem(world: World) {
  const colliders = world.query<[string, Position, Collider]>([
    "entity-id",
    "position",
    "collider",
  ]);

  for (const [entityA, positionA, colliderA] of colliders) {
    for (const [entityB, positionB, colliderB] of colliders) {
      if (entityA === entityB) {
        // Exclude collisions with itself
        continue;
      }

      if (colliderA.type === "aabb" && colliderB.type === "aabb") {
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
            name: "collision",
            contactPoint: intersection.contactPoint, // Contact point on a AABB is just its local origin
            normal: intersection.normal,
            penetration: intersection.penetration,
            entityId: entityB,
          };

          world.entity(entityA).replaceComponent(collision);
        }
      }
    }
  }
}

function collisionLoggingSystem(world: World) {
  for (const [collision] of world.query<[Collision]>(["collision"])) {
    console.debug(JSON.stringify(collision));
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
  for (const [entityId, collision] of world.query<[string, Collision]>([
    "entity-id",
    "collision",
  ])) {
    world.entity(entityId).removeComponent(collision.name);
  }
}

export default collisionSystem;

export { collisionCleanupSystem, collisionLoggingSystem };
