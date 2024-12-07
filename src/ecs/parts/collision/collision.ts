import p5 from "p5";
import World from "../../core/World/World";
import Engine from "../../core/Engine/Engine";
import { Collider } from "./components/Collider";
import { Position } from "../../components/Position";
import collisionSystem, {
  collisionCleanupSystem,
  collisionLoggingSystem,
} from "./collision-systems";

/**
 * A part is a grouping of systems and other things that can be added onto a system enabling
 * the functionality to be easily broken up and to share functionality between games
 */
function collisions(visualiseColliders: boolean = false) {
  return <T extends Record<string, unknown>>(engine: Engine<T>) => {
    engine.system(
      "collisionLoggingSystem",
      { event: "update" },
      collisionLoggingSystem
    );

    engine.system("collisionSystem", { event: "update" }, collisionSystem);

    // Collisions dont work because they need to be cleaned up at the end of the update
    engine.system(
      "collisionCleanupSystem",
      { event: "after-update" },
      collisionCleanupSystem
    );

    if (visualiseColliders) {
      engine.system(
        "collisionRender",
        { event: "update" },

        function collisionRenderSystem(world: World, { p }: { p: p5 }) {
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
      );
    }
  };
}

export default collisions;
