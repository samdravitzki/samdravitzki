import {
  Bounds,
  Part,
  Position,
  ResourcePool,
  Vector,
  World,
} from "@dravitzki/dufus-engine";
import { MousePosition } from "@dravitzki/dufus-engine/parts/p5";
import {
  AiPaddle,
  AiPaddleTarget,
  Paddle,
  PlayerPaddle,
  Speed,
} from "../../common/components";
import { ApplicationState } from "../../common/types";
import { singleQuery } from "../../common/query";

export const paddlePart = (): Part<
  { update: void },
  { "app-state": ApplicationState }
> => {
  return ({ triggerBuilder, registerSystem }) => {
    const whilePlaying = triggerBuilder
      .on("update")
      .when("app-state")
      .is("in-game");

    registerSystem(
      "modular-pong:move-player-paddle",
      whilePlaying,
      movePlayerPaddle,
    );
    registerSystem("modular-pong:move-ai-paddle", whilePlaying, moveAiPaddle);
    registerSystem(
      "modular-pong:constrain-ai-paddle",
      whilePlaying,
      constrainAiPaddle,
    );
  };
};

function clampPaddle(position: Vector, canvasBounds: Bounds) {
  return Vector.create(
    position.x,
    Math.min(
      canvasBounds.max.y - 35,
      Math.max(canvasBounds.min.y + 35, position.y),
    ),
  );
}

export function movePlayerPaddle(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");
  const mousePosition = resources.get<MousePosition>("mouse-position");

  for (const [position] of world.query([Position, PlayerPaddle])) {
    const positionChange = mousePosition.y - position.componentData.position.y;
    position.componentData.position = clampPaddle(
      position.componentData.position.plus(Vector.create(0, positionChange)),
      canvasBounds,
    );
  }
}

export function constrainAiPaddle(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  for (const [position] of world.query([Position, AiPaddle])) {
    position.componentData.position = clampPaddle(
      position.componentData.position,
      canvasBounds,
    );
  }
}

export function moveAiPaddle(world: World) {
  const [targetPosition] = singleQuery(
    world.query([Position, AiPaddleTarget]),
    "AI paddle target",
  );

  for (const [position, speed] of world.query([
    Position,
    Speed,
    Paddle,
    AiPaddle,
  ])) {
    position.componentData.position = position.componentData.position.plus(
      Vector.create(
        0,
        (targetPosition.componentData.position.y -
          position.componentData.position.y) *
          speed.componentData,
      ),
    );
  }
}
