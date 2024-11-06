import Bounds from "../Bounds/Bounds";
import createBundle from "../ecs/Bundle/createBundle";
import World from "../ecs/World/World";
import Vector from "../Vector/Vector";

function setupBoundaries(world: World) {
  const playBounds = Bounds.create(
    Vector.create(0, 0),
    Vector.create(500, 250),
  );

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
        playBounds.center.x,
        playBounds.min.y + walllThickness / 2,
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
        playBounds.center.x,
        playBounds.max.y - walllThickness / 2,
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
      start: new Vector(0, -playBounds.center.y),
      end: new Vector(0, playBounds.center.y),
    },
    {
      name: "position",
      position: playBounds.center,
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
        playBounds.center.y,
      ),
    },
    {
      name: "collider",
      type: "aabb",
      layer: "wall",
      width: backboardThickness,
      height: 230,
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
        playBounds.center.y,
      ),
    },
    {
      name: "collider",
      type: "aabb",
      layer: "wall",
      width: backboardThickness,
      height: 230,
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

export default setupBoundaries;
