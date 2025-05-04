import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";
import Engine from "../../ecs/core/Engine/Engine";
import World from "../../ecs/core/World/World";
import { ResourcePool } from "../../ecs/core/Engine/ResourcePool";
import Bounds from "../../ecs/core/Bounds/Bounds";
import { onStart } from "../../ecs/core/Engine/SystemTrigger";

function setupPaddlesPart<T extends Record<string, unknown>>(
  engine: Engine<T>
) {
  function setupPaddles(world: World, resources: ResourcePool) {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");
    const paddleSize = 40;
    const paddleWallOffset = 10;

    const playerPaddleBundle = createBundle([
      "player",
      "paddle",
      {
        name: "primitive",
        fill: [240, 60, 100],
        type: "square",
        width: 5,
        height: paddleSize,
      },
      {
        name: "position",
        position: new Vector(
          canvasBounds.min.x + paddleWallOffset,
          canvasBounds.max.y / 2
        ),
      },
      {
        name: "collider",
        type: "aabb",
        layer: "wall",
        width: 5,
        height: paddleSize,
      },
    ]);

    // The position the ai paddle is aiming to end up in
    const aiPaddleTarget = createBundle([
      "ai-paddle-target",
      {
        name: "position",
        position: new Vector(0, 0),
      },
    ]);

    const aiPaddleBundle = createBundle([
      "ai",
      "paddle",
      {
        name: "primitive",
        fill: [240, 60, 100],
        type: "square",
        width: 5,
        height: paddleSize,
      },
      {
        name: "position",
        position: new Vector(
          canvasBounds.max.x - paddleWallOffset,
          canvasBounds.max.y / 2
        ),
      },
      {
        name: "speed",
        value: 0.01,
      },
      {
        name: "collider",
        type: "aabb",
        width: 5,
        height: paddleSize,
      },
    ]);

    world.addBundle(aiPaddleTarget);
    world.addBundle(playerPaddleBundle);
    world.addBundle(aiPaddleBundle);
  }

  engine.system("setupPaddles", onStart(), setupPaddles);
}

export default setupPaddlesPart;
