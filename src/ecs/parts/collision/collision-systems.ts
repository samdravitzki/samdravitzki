import World from "../../core/World/World";
import { Position } from "../../components/Position";
import { Collider } from "./components/Collider";
import { Collision } from "./components/Collision";
import aabbAabbIntersection from "./intersection/aabb-aabb-intersection";
import { Aabb } from "./intersection/intersection-shapes";
import { ResourcePool } from "../../core/Engine/ResourcePool";
import { EventEmitter } from "../../core/System/System";

type CollisionEventPayload = {
  type: "enter" | "exit";
  collidingEntity: string;
  collidedEntity: string;
};

type CollisionSystemEvents = {
  collision: CollisionEventPayload;
};

function collisionSystem(
  world: World,
  resources: ResourcePool,
  state: unknown,
  eventEmitter: EventEmitter<CollisionSystemEvents>,
) {
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

          if (!world.entity(entityA).hasComponent("collision")) {
            eventEmitter.emit({
              event: "collision",
              payload: {
                type: "enter",
                collidingEntity: entityA,
                collidedEntity: entityB,
              },
            });
          }

          /**
           * An entity can only store one collision with another entity. This wont work
           * if there is a need to store multiple collisions. May need to update the Collision
           * component to store the list of entities an entity is Colliding with instead, if
           * needed in the future.
           */
          world.entity(entityA).replaceComponent(collision);
        } else {
          const collision = world
            .entity(entityA)
            .getComponent("collision") as Collision;

          if (collision && collision.entityId === entityB) {
            world.entity(entityA).removeComponent("collision");
            eventEmitter.emit({
              event: "collision",
              payload: {
                type: "exit",
                collidingEntity: entityA,
                collidedEntity: entityB,
              },
            });
          }
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

export default collisionSystem;

export { collisionLoggingSystem };
export type { CollisionEventPayload };
