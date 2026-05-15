import { Position } from "../../ecs/components/Position";
import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";
import { Collider } from "../../ecs/parts/collision/components/Collider";
import { ShapeStyle } from "../../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Square } from "../../ecs/parts/p5/shape-components";

function createPaddle(position: Vector, owner: "player" | "ai") {
  const paddleSize = 40;

  return createBundle([
    owner,
    "paddle",
    {
      name: "square",
      width: 5,
      height: paddleSize,
    } satisfies Square,
    {
      name: "shape-style",
      fill: [240, 60, 100],
    } satisfies ShapeStyle,
    {
      name: "position",
      position,
    } satisfies Position,
    {
      name: "speed",
      value: 0.01,
    },
    {
      name: "collider",
      type: "aabb",
      layer: "wall",
      width: 5,
      height: paddleSize,
    } satisfies Collider,
  ]);
}

export default createPaddle;
