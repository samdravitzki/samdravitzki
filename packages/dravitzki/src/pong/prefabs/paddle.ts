import { Collider } from "@dravitzki/dufus-engine/parts/collision";
import { Square, ShapeStyle } from "@dravitzki/dufus-engine/parts/p5";
import { Speed } from "../components";
import { tag, Vector, createBundle, Position } from "@dravitzki/dufus-engine";

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
