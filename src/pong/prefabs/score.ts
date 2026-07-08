import Position from "../../ecs/components/Position";
import createBundle from "../../ecs/core/Bundle/createBundle";
import { tag } from "../../ecs/core/Component/Component";
import Vector from "../../ecs/core/Vector/Vector";
import { ShapeStyle } from "../../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Text } from "../../ecs/parts/p5/shape-components";

export const playerScoreTag = tag("player-score");
export const aiScoreTag = tag("ai-score");

function createScore(
  position: Vector,
  align: "left" | "right",
  type: "player-score" | "ai-score",
) {
  return createBundle([
    type === "player-score" ? playerScoreTag() : aiScoreTag(),
    Position({
      position,
    }),
    Text({
      text: "0",
      align,
      size: 25,
    }),
    ShapeStyle({
      stroke: [240, 60, 100],
      strokeWeight: 2,
      fill: [240, 60, 100],
    }),
  ]);
}

export default createScore;
