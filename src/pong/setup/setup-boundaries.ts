import Bounds from "../../ecs/core/Bounds/Bounds";
import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";
import Engine from "../../ecs/core/Engine/Engine";
import World from "../../ecs/core/World/World";
import { ResourcePool } from "../../ecs/core/Engine/ResourcePool";
import { onStart } from "../../ecs/core/Engine/SystemTrigger";

function setupBoundariesPart<T extends Record<string, unknown>>(
  engine: Engine<T>
) {
  function setupBoundaries(world: World, resources: ResourcePool) {
    const playBounds = resources.get<Bounds>("canvas-bounds");

    const walllThickness = 10;

    const backboardThickness = 5;

    const northWallBundle = createBundle([
      {
        name: "primitive",
        fill: [240, 60, 100],
        type: "square",
        width: playBounds.max.x,
        height: walllThickness,
      },
      {
        name: "position",
        position: new Vector(
          playBounds.center.center.x,
          playBounds.min.y + walllThickness / 2
        ),
      },
      {
        name: "collider",
        layer: "wall",
        type: "aabb",
        width: playBounds.max.x,
        height: walllThickness,
      },
    ]);

    const southWallBundle = createBundle([
      {
        name: "primitive",
        fill: [240, 60, 100],
        type: "square",
        width: playBounds.max.x,
        height: walllThickness,
      },
      {
        name: "position",
        position: new Vector(
          playBounds.center.center.x,
          playBounds.max.y - walllThickness / 2
        ),
      },
      {
        name: "collider",
        type: "aabb",
        layer: "wall",
        width: playBounds.max.x,
        height: walllThickness,
      },
    ]);

    const centerLineBundle = createBundle([
      {
        name: "primitive",
        stroke: [240, 60, 100],
        strokeWeight: 2,
        fill: [240, 60, 100],
        type: "line",
        start: new Vector(0, -playBounds.center.center.y),
        end: new Vector(0, playBounds.center.center.y),
      },
      {
        name: "position",
        position: playBounds.center.center,
      },
    ]);

    const leftBackboardBundle = createBundle([
      {
        name: "primitive",
        fill: [352, 94, 100],
        type: "square",
        width: backboardThickness,
        height: playBounds.max.y,
      },
      {
        name: "position",
        position: new Vector(
          playBounds.min.x + backboardThickness / 2,
          playBounds.center.center.y
        ),
      },
      {
        name: "collider",
        type: "aabb",
        layer: "wall",
        width: backboardThickness,
        height: playBounds.max.y - 25,
      },
      {
        name: "backboard",
        owner: "player",
      },
    ]);

    const rightBackboardBundle = createBundle([
      {
        name: "primitive",
        fill: [352, 94, 100],
        type: "square",
        width: backboardThickness,
        height: playBounds.max.y,
      },
      {
        name: "position",
        position: new Vector(
          playBounds.max.x - backboardThickness / 2,
          playBounds.center.center.y
        ),
      },
      {
        name: "collider",
        type: "aabb",
        layer: "wall",
        width: backboardThickness,
        height: playBounds.max.y - 25,
      },
      {
        name: "backboard",
        owner: "ai",
      },
    ]);

    world.addBundle(northWallBundle);
    world.addBundle(southWallBundle);
    world.addBundle(centerLineBundle);
    world.addBundle(leftBackboardBundle);
    world.addBundle(rightBackboardBundle);
  }
  engine.system("setupBoundaries", onStart(), setupBoundaries);
}

export default setupBoundariesPart;
