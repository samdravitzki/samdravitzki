import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";
import Engine from "../../ecs/core/Engine/Engine";
import World from "../../ecs/core/World/World";
import { ResourcePool } from "../../ecs/core/Engine/ResourcePool";
import Bounds from "../../ecs/core/Bounds/Bounds";
import { onStart } from "../../ecs/core/Engine/SystemTrigger";
import createPaddle from "../prefabs/paddle";

function setupPaddlesPart<T extends Record<string, unknown>>(
  engine: Engine<T>
) {
  function setupPaddles(world: World, resources: ResourcePool) {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");
    const paddleWallOffset = 10;

    const playerPaddleBundle = createPaddle(
      new Vector(canvasBounds.min.x + paddleWallOffset, canvasBounds.max.y / 2),
      "player"
    );

    // The position the ai paddle is aiming to end up in
    const aiPaddleTarget = createBundle([
      "ai-paddle-target",
      {
        name: "position",
        position: new Vector(0, 0),
      },
    ]);

    const aiPaddleBundle = createPaddle(
      new Vector(canvasBounds.max.x - paddleWallOffset, canvasBounds.max.y / 2),
      "ai"
    );
    world.addBundle(aiPaddleTarget);
    world.addBundle(playerPaddleBundle);
    world.addBundle(aiPaddleBundle);
  }

  engine.system("setupPaddles", onStart(), setupPaddles);
}

export default setupPaddlesPart;
