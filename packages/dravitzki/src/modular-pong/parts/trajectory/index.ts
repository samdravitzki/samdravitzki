import {
  Bounds,
  Component,
  createBundle,
  Part,
  Position,
  ResourcePool,
  State,
  Vector,
  World,
} from "@dravitzki/dufus-engine";
import { castRay } from "@dravitzki/dufus-engine/parts/collisions";
import { Line, ShapeStyle } from "@dravitzki/dufus-engine/parts/p5";
import {
  AiPaddleTarget,
  BackboardOwner,
  Ball,
  TrajectoryLine,
  Velocity,
} from "../../common/components";
import { requiredComponent, singleQuery } from "../../common/query";
import { ApplicationState } from "../../common/types";

export const trajectoryPart = (): Part<
  { update: void },
  { "app-state": ApplicationState; "render-trajectory": boolean }
> => {
  return ({ triggerBuilder, registerSystem }) => {
    registerSystem(
      "modular-pong:update-trajectory",
      triggerBuilder.on("update").when("app-state").is("in-game"),
      updateBallTrajectory,
    );
  };
};

export function updateBallTrajectory(
  world: World,
  resources: ResourcePool,
  state: { "render-trajectory": State<boolean> },
) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");
  const [targetPosition] = singleQuery(
    world.query([Position, AiPaddleTarget]),
    "AI paddle target",
  );
  const [ballPosition, ballVelocity] = singleQuery(
    world.query([Position, Velocity, Ball]),
    "ball",
  );

  for (const [entityId] of world.query(["entity-id", TrajectoryLine])) {
    world.removeEntity(entityId);
  }

  let start = ballPosition.componentData.position.minus(
    ballVelocity.componentData.normalised().times(10),
  );
  let direction = ballVelocity.componentData;

  for (let bounces = 0; bounces < 20; bounces += 1) {
    const hit = castRay(
      world,
      {
        position: start,
        direction,
        length: canvasBounds.size[0] * 2,
      },
      { layer: "wall" },
    )[0];

    if (!hit) {
      return;
    }

    const components: Component[] = [
      TrajectoryLine(),
      Position({ position: start }),
    ];

    if (state["render-trajectory"].value) {
      components.push(
        Line({ start: Vector.create(0, 0), end: hit.position.minus(start) }),
        ShapeStyle({
          stroke: [240, 60, 100],
          dash: bounces === 0 ? [0] : [5, 5],
          strokeWeight: 2,
        }),
      );
    }

    world.addBundle(createBundle(components));

    const backboardOwner = world.entity(hit.entityId).getComponent(BackboardOwner);

    if (backboardOwner?.componentData === "ai") {
      targetPosition.componentData.position = hit.position;
      return;
    }

    start = hit.position;
    direction = direction.reflect(hit.normal).normalised();
  }
}
