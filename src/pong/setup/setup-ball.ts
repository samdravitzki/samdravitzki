import Vector from "../../ecs/core/Vector/Vector";
import Engine from "../../ecs/core/Engine/Engine";
import { ResourcePool } from "../../ecs/core/Engine/ResourcePool";
import World from "../../ecs/core/World/World";
import Bounds from "../../ecs/core/Bounds/Bounds";
import { onStart } from "../../ecs/core/Engine/SystemTrigger";
import createBall from "../prefabs/ball";

function setupBallPart<T extends Record<string, unknown>>(engine: Engine<T>) {
  function setupBall(world: World, resources: ResourcePool) {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");

    const ballBundle = createBall(
      new Vector(canvasBounds.max.x / 2, canvasBounds.max.y / 2)
    );

    world.addBundle(ballBundle);
  }
  engine.system("setupBall", onStart(), setupBall);
}

export default setupBallPart;
