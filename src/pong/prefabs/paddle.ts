import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";

function createPaddle(position: Vector, owner: "player" | "ai") {
  const paddleSize = 40;

  return createBundle([
    owner,
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
      position,
    },
    {
      name: "collider",
      type: "aabb",
      layer: "wall",
      width: 5,
      height: paddleSize,
    },
  ]);
}

export default createPaddle;
