import { Part, Position, World } from "@dravitzki/dufus-engine";
import { Ball, Speed, Velocity } from "../../common/components";
import { ApplicationState } from "../../common/types";
import { singleQuery } from "../../common/query";

export const ballPart = (): Part<
  { update: void },
  { "app-state": ApplicationState }
> => {
  return ({ triggerBuilder, registerSystem }) => {
    registerSystem(
      "modular-pong:move-ball",
      triggerBuilder.on("update").when("app-state").is("in-game"),
      moveBall,
    );
  };
};

export function moveBall(world: World) {
  const [velocity, position, speed] = singleQuery(
    world.query([Velocity, Position, Speed, Ball]),
    "ball",
  );

  position.componentData.position = position.componentData.position.plus(
    velocity.componentData.times(speed.componentData),
  );
}
