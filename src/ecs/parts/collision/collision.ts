import p5 from "p5";
import World from "../../core/World/World";
import { Collider } from "./components/Collider";
import { Position } from "../../components/Position";
import collisionSystem, {
  collisionLoggingSystem,
  CollisionEventPayload,
} from "./collision-systems";
import { ResourcePool } from "../../core/Engine/ResourcePool";
import { Part } from "../../core/Part/Part";

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
}

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
  }> = ({ registerSystem, triggerBuilder }) => {
    registerSystem(
      "collisionSystem",
      triggerBuilder.on("update"),
      collisionSystem,
    );

    if (visualiseColliders) {
      registerSystem(
        "collisionRender",
        triggerBuilder.on("after-update"),
        collisionRenderSystem,
      );
    }

    if (logging) {
      registerSystem(
        "collisionLoggingSystem",
        triggerBuilder.on("update"),
        collisionLoggingSystem,
      );
    }
  };

  return part;
}

export default collisions;
export type { CollisionEventPayload };
