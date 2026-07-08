import Position from "../../ecs/components/Position";
import createBundle from "../../ecs/core/Bundle/createBundle";
import { tag } from "../../ecs/core/Component/Component";
import Vector from "../../ecs/core/Vector/Vector";
import { Collider } from "../../ecs/parts/collision/components/Collider";
import { ShapeStyle } from "../../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Square } from "../../ecs/parts/p5/shape-components";
import { Speed } from "../components";

export const paddleTag = tag("paddle");
export const playerPaddleTag = tag("player");
export const aiPaddleTag = tag("ai");

function createPaddle(position: Vector, owner: "player" | "ai") {
  const paddleSize = 40;

  return createBundle([
    owner === "player" ? playerPaddleTag() : aiPaddleTag(),
    paddleTag(),
    Square({
      width: 5,
      height: paddleSize,
    }),
    ShapeStyle({
      fill: [240, 60, 100],
    }),
    Position({
      position,
    }),
    Speed(0.01),
    Collider({
      type: "aabb",
      layer: "wall",
      width: 5,
      height: paddleSize,
    }),
  ]);
}

export default createPaddle;
