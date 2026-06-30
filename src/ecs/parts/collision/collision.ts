import p5 from "p5";
import World from "../../core/World/World";
import { Collider } from "./components/Collider";
import { Position } from "../../components/Position";
import collisionSystem, { CollisionEventPayload } from "./collision-systems";
import { ResourcePool } from "../../core/Engine/ResourcePool";
import { Part } from "../../core/Part/Part";
import { CollisionContact } from "./components/Collision";

/**
 * A part is a grouping of systems and other things that can be added onto a system enabling
 * the functionality to be easily broken up and to share functionality between games
 */
function collisions(
  visualiseColliders: boolean = false,
  logging: boolean = false,
) {
  const part: Part<{
    update: void;
    "after-update": void;
    collision: CollisionEventPayload;
    "world:entity-removed": { entityId: string };
  }> = ({ registerSystem, triggerBuilder }) => {
    registerSystem(
      "collisionSystem",
      triggerBuilder.on("update"),
      collisionSystem,
    );

    registerSystem(
      "contactCleanupSystem",
      triggerBuilder.on("world:entity-removed"),
      function contactCleanupSystem(
        world: World,
        resources: ResourcePool,
        state: unknown,
        eventEmitter,
        payload: { entityId: string },
      ) {
        const { entityId } = payload;
        const collisionContactQuery = world.query<[string, CollisionContact]>([
          "entity-id",
          "collision-contact",
        ]);

        for (const [contactEntityId, contact] of collisionContactQuery) {
          if (contact.entityA === entityId || contact.entityB === entityId) {
            world.removeEntity(contactEntityId);
          }
        }
      },
    );

    if (visualiseColliders) {
      registerSystem(
        "collisionRender",
        triggerBuilder.on("after-update"),
        function collisionRenderSystem(world: World, resources: ResourcePool) {
          const p = resources.get<p5>("p5");
          for (const [col, pos] of world.query(["collider", "position"]) as [
            Collider,
            Position,
          ][]) {
            if (col.type === "aabb") {
              p.stroke(111, 100, 100);
              p.strokeWeight(0.5);
              p.noFill();
              p.rect(pos.position.x, pos.position.y, col.width, col.height);
            }
          }
        },
      );
    }

    if (logging) {
      registerSystem(
        "collisionLoggingSystem",
        triggerBuilder.on("update"),
        function collisionLoggingSystem(world: World) {
          for (const [collision] of world.query<[CollisionContact]>([
            "collision",
          ])) {
            console.debug(JSON.stringify(collision));
          }
        },
      );
    }
  };

  return part;
}

export default collisions;
export type { CollisionEventPayload };
