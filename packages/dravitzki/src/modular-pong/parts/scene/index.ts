import {
  Bounds,
  createBundle,
  Part,
  Position,
  ResourcePool,
  Vector,
  World,
} from "@dravitzki/dufus-engine";
import { Line, ShapeStyle } from "@dravitzki/dufus-engine/parts/p5";
import {
  createAiPaddleTarget,
  createBackboard,
  createBall,
  createPaddle,
  createScore,
  createWall,
} from "./prefabs";

export const scenePart = (): Part<{ setup: void }> => {
  return ({ triggerBuilder, registerSystem }) => {
    registerSystem(
      "modular-pong:setup-scene",
      triggerBuilder.on("setup"),
      setupScene,
    );
  };
};

export function setupScene(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");
  const wallThickness = 10;
  const backboardThickness = 5;
  const paddleWallOffset = 10;
  const scoreXOffset = 5;
  const scoreYOffset = 35;

  world.addBundles([
    createBall(new Vector(canvasBounds.max.x / 2, canvasBounds.max.y / 2)),
    createWall(
      new Vector(
        canvasBounds.center.center.x,
        canvasBounds.min.y + wallThickness / 2,
      ),
      canvasBounds.max.x,
      wallThickness,
    ),
    createWall(
      new Vector(
        canvasBounds.center.center.x,
        canvasBounds.max.y - wallThickness / 2,
      ),
      canvasBounds.max.x,
      wallThickness,
    ),
    createBundle([
      Line({
        start: new Vector(0, -canvasBounds.center.center.y),
        end: new Vector(0, canvasBounds.center.center.y),
      }),
      ShapeStyle({
        stroke: [240, 60, 100],
        strokeWeight: 2,
        fill: [240, 60, 100],
      }),
      Position({ position: canvasBounds.center.center }),
    ]),
    createBackboard(
      new Vector(
        canvasBounds.min.x + backboardThickness / 2,
        canvasBounds.center.center.y,
      ),
      backboardThickness,
      canvasBounds.max.y - 25,
      "player",
    ),
    createBackboard(
      new Vector(
        canvasBounds.max.x - backboardThickness / 2,
        canvasBounds.center.center.y,
      ),
      backboardThickness,
      canvasBounds.max.y - 25,
      "ai",
    ),
    createAiPaddleTarget(),
    createPaddle(
      new Vector(canvasBounds.min.x + paddleWallOffset, canvasBounds.max.y / 2),
      "player",
    ),
    createPaddle(
      new Vector(canvasBounds.max.x - paddleWallOffset, canvasBounds.max.y / 2),
      "ai",
    ),
    createScore(
      new Vector(
        canvasBounds.max.x / 2 - scoreXOffset,
        canvasBounds.min.y + scoreYOffset,
      ),
      "right",
      "player",
    ),
    createScore(
      new Vector(
        canvasBounds.max.x / 2 + scoreXOffset,
        canvasBounds.min.y + scoreYOffset,
      ),
      "left",
      "ai",
    ),
  ]);
}
