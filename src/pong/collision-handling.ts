import engine from "./pong-engine";

import collisionSystem, {
  collisionCleanupSystem,
  collisionLoggingSystem,
} from "./collision/collision-system";

// engine.system(
//   "collisionRender",
//   { event: "update" },

//   function collisionRenderSystem(world: World, { p }: { p: p5 }) {
//     for (const [col, pos] of world.query(["collider", "position"]) as [
//       Collider,
//       Position,
//     ][]) {
//       if (col.type === "aabb") {
//         p.stroke(111, 100, 100);
//         p.strokeWeight(0.5);
//         p.noFill();
//         p.rect(pos.position.x, pos.position.y, col.width, col.height);
//       }
//     }
//   }
// );

engine.system(
  "collisionSystem",
  { state: "app-state", value: "in-game" },
  collisionSystem
);

engine.system(
  "collisionLoggingSystem",
  { state: "app-state", value: "in-game" },
  collisionLoggingSystem
);

// Collisions dont work because they need to be cleaned up at the end of the update
engine.system(
  "collisionCleanupSystem",
  { state: "app-state", value: "in-game" },
  collisionCleanupSystem,
  true
);
