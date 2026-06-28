import World from "../../core/World/World";
import { Position } from "../../components/Position";
import { Collider } from "./components/Collider";
import { CollisionContact } from "./components/Collision";
import aabbAabbIntersection from "./intersection/aabb-aabb-intersection";
import { Aabb } from "./intersection/intersection-shapes";
import { ResourcePool } from "../../core/Engine/ResourcePool";
import { EventEmitter } from "../../core/System/System";
import Vector from "../../core/Vector/Vector";

type CollisionEventPayload = {
  entityA: string;
  entityB: string;
} & (
  | {
      type: "enter";
      contactPoint: Vector; // Contact point on a AABB is just its local origin
      normal: Vector;
      penetration: number;
    }
  | {
      type: "exit";
    }
);

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

        // Not ideal to query the world for collisions every time, but this is a simple way to check if a collision already exists
        const existingContact = world
          .query<[string, CollisionContact]>(["entity-id", "collision-contact"])
          .find(([entity, existingContact]) => {
            const existing = existingContact as CollisionContact;
            return (
              (existing.entityA === entityA && existing.entityB === entityB) ||
              (existing.entityA === entityB && existing.entityB === entityA)
            );
          });

        if (intersection) {
          const collision: CollisionContact = {
            name: "collision-contact",
            entityA: entityA,
            entityB: entityB,
            contactPoint: intersection.contactPoint, // Contact point on a AABB is just its local origin
            normal: intersection.normal,
            penetration: intersection.penetration,
          };

          if (!existingContact) {
            eventEmitter.emit({
              event: "collision",
              payload: {
                type: "enter",
                entityA: entityA,
                entityB: entityB,
                contactPoint: intersection.contactPoint,
                normal: intersection.normal,
                penetration: intersection.penetration,
              },
            });

            const collisionEntity = world.createEntity();
            collisionEntity.addComponent(collision);
            // add label
            collisionEntity.addComponent({
              name: "label",
              text: `contact (${entityA.slice(0, 4)}, ${entityB.slice(0, 4)})`,
            });
          } else {
            const [entity, contact] = existingContact;
            contact.contactPoint = intersection.contactPoint;
            contact.normal = intersection.normal;
            contact.penetration = intersection.penetration;
          }
        } else {
          if (existingContact) {
            const [entity] = existingContact;
            world.removeEntity(entity);

            eventEmitter.emit({
              event: "collision",
              payload: {
                type: "exit",
                entityA: entityA,
                entityB: entityB,
              },
            });
          }
        }
      }
    }
  }
}

function collisionLoggingSystem(world: World) {
  for (const [collision] of world.query<[CollisionContact]>(["collision"])) {
    console.debug(JSON.stringify(collision));
  }
}

export default collisionSystem;

export { collisionLoggingSystem };
export type { CollisionEventPayload };
