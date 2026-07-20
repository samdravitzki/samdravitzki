import p5 from "p5";
import World from "../../core/World/World";
import { Collider } from "./components/Collider";
import collisionSystem, { CollisionEventPayload } from "./collision-systems";
import { ResourcePool } from "../../core/Engine/ResourcePool";
import { Part } from "../../core/Part/Part";
import { CollisionContact } from "./components/Collision";
import { Position } from "../../components";

/**
 * A part is a grouping of systems and other things that can be added onto a system enabling
 * the functionality to be easily broken up and to share functionality between games
 */
function collisions(
  {
    visualiseColliders = false,
    logging = false,
  }: {
    visualiseColliders: boolean;
    logging: boolean;
  } = { visualiseColliders: false, logging: false },
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
        const collisionContactQuery = world.query([
          "entity-id",
          CollisionContact,
        ]);

        for (const [contactEntityId, contact] of collisionContactQuery) {
          if (
            contact.componentData.entityA === entityId ||
            contact.componentData.entityB === entityId
          ) {
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
          for (const [col, pos] of world.query([Collider, Position])) {
            if (col.componentData.type === "aabb") {
              p.stroke(111, 100, 100);
              p.strokeWeight(0.5);
              p.noFill();
              p.rect(
                pos.componentData.position.x,
                pos.componentData.position.y,
                col.componentData.width,
                col.componentData.height,
              );
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
          for (const [collision] of world.query([CollisionContact])) {
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
