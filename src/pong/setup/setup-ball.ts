import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";
import Engine from "../../ecs/core/Engine/Engine";
import { ResourcePool } from "../../ecs/core/Engine/ResourcePool";
import World from "../../ecs/core/World/World";
import Bounds from "../../ecs/core/Bounds/Bounds";
import { onStart } from "../../ecs/core/Engine/SystemTrigger";

function setupBallPart<T extends Record<string, unknown>>(engine: Engine<T>) {
  function setupBall(world: World, resources: ResourcePool) {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");

    const ballBundle = createBundle([
      "ball",
      {
        name: "primitive",
        stroke: [240, 60, 100],
        strokeWeight: 2,
        fill: false,
        type: "circle",
        radius: 5,
      },
      {
        name: "position",
        position: new Vector(canvasBounds.max.x / 2, canvasBounds.max.y / 2),
      },
      {
        name: "velocity",
        velocity: new Vector(-0.5, -0.5),
      },
      {
        name: "speed",
        value: 5,
      },
      {
        name: "collider",
        type: "aabb",
        width: 10,
        height: 10,
      },
    ]);

    world.addBundle(ballBundle);
  }
  engine.system("setupBall", onStart(), setupBall);
}

export default setupBallPart;
