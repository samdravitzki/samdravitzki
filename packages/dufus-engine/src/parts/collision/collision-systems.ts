import World from "../../core/World/World";
import { Collider, ColliderData } from "./components/Collider";
import { CollisionContact } from "./components/Collision";
import aabbAabbIntersection from "./intersection/aabb-aabb-intersection";
import { Aabb } from "./intersection/intersection-shapes";
import { ResourcePool } from "../../core/Engine/ResourcePool";
import { EventEmitter } from "../../core/System/System";
import Vector from "../../core/Vector/Vector";
import Label from "../../components/Label";
import Position from "../../components/Position";

// TODO: Renmame to CollisionContactEvent
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
  const colliders = world.query(["entity-id", Position, Collider]);

  for (const [entityA, positionA, colliderA] of colliders) {
    for (const [entityB, positionB, colliderB] of colliders) {
      if (entityA === entityB) {
        // Exclude collisions with itself
        continue;
      }

      if (
        colliderA.componentData.type === "aabb" &&
        colliderB.componentData.type === "aabb"
      ) {
        const aabb1: Aabb = {
          position: positionA.componentData.position,
          width: colliderA.componentData.width,
          height: colliderA.componentData.height,
        };

        const aabb2: Aabb = {
          position: positionB.componentData.position,
          width: colliderB.componentData.width,
          height: colliderB.componentData.height,
        };

        const intersection = aabbAabbIntersection(aabb1, aabb2);

        // Not ideal to query the world for collisions every time, but this is a simple way to check if a collision already exists
        const existingContact = world
          .query(["entity-id", CollisionContact])
          .find(([entity, existingContact]) => {
            const existing = existingContact;
            return (
              (existing.componentData.entityA === entityA &&
                existing.componentData.entityB === entityB) ||
              (existing.componentData.entityA === entityB &&
                existing.componentData.entityB === entityA)
            );
          });

        if (intersection) {
          const contact = CollisionContact({
            entityA: entityA,
            entityB: entityB,
            contactPoint: intersection.contactPoint, // Contact point on a AABB is just its local origin
            normal: intersection.normal,
            penetration: intersection.penetration,
          });

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
            collisionEntity.addComponent(contact);
            // add label
            collisionEntity.addComponent(
              Label({
                text: `contact (${entityA.slice(0, 4)}, ${entityB.slice(0, 4)})`,
              }),
            );
          } else {
            const [entity, contact] = existingContact;
            contact.componentData.contactPoint = intersection.contactPoint;
            contact.componentData.normal = intersection.normal;
            contact.componentData.penetration = intersection.penetration;
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

export default collisionSystem;

export type { CollisionEventPayload };
